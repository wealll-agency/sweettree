import mongoose from 'mongoose';
import crypto from 'crypto';
import { encrypt, decrypt } from '../utils/ccavenue.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import { logActivity } from '../middleware/logger.js';

// CCAvenue configuration will be drawn directly from environment variables

// Helper: Calculate order totals
const calculateOrderTotals = async (items, couponCode) => {
  let subtotal = 0;
  
  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});

  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product)) {
      const err = new Error(`Invalid product ID format for: ${item.name}`);
      err.statusCode = 400;
      throw err;
    }
    const product = productMap[item.product.toString()];
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }
    
    // Check stock
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
    
    let basePrice = product.price;
    // Check if a specific pack size was selected
    if (item.size && product.packSizes && product.packSizes.length > 0) {
      const selectedPack = product.packSizes.find(
        p => `${p.weight} ${p.unit}` === item.size
      );
      if (selectedPack) {
        basePrice = selectedPack.price;
      } else if (item.size !== `${product.unitValue || 1} ${product.unit || 'Pack'}`) {
        throw new Error(`Invalid pack size selected for: ${item.name}`);
      }
    }
    
    const activePrice = product.discount > 0 
      ? (product.discountType === 'Percent' ? Math.round(basePrice * (1 - product.discount / 100)) : Math.max(0, basePrice - product.discount))
      : basePrice;
      
    subtotal += activePrice * item.quantity;
    item.price = activePrice; // Bind exact price paid
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid()) {
      discount = Math.round((subtotal * coupon.discountPercentage) / 100);
    }
  }

  // Tax = 5% of discounted price
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.05);
  
  // Shipping: Free above 500, else 40 INR
  const shippingFee = taxableAmount > 500 ? 0 : 40;
  
  const totalAmount = taxableAmount + tax + shippingFee;

  return { subtotal, discount, tax, shippingFee, totalAmount, validatedItems: items };
};

// @desc    Create a new order & initiate Razorpay payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, deliveryAddress, couponCode } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const { subtotal, discount, tax, shippingFee, totalAmount, validatedItems } = await calculateOrderTotals(items, couponCode);

    // 1. Create Local Order (Pending Payment)
    const mappedDeliveryAddress = {
      name: deliveryAddress?.name || req.user?.name || 'Customer',
      phone: deliveryAddress?.phone || req.user?.phone || '9999999999',
      pincode: deliveryAddress?.pincode || deliveryAddress?.zipCode || '',
      locality: deliveryAddress?.locality || deliveryAddress?.street || deliveryAddress?.address || deliveryAddress?.city || '',
      address: deliveryAddress?.address || deliveryAddress?.street || deliveryAddress?.locality || '',
      city: deliveryAddress?.city || '',
      state: deliveryAddress?.state || '',
      landmark: deliveryAddress?.landmark || '',
      alternatePhone: deliveryAddress?.alternatePhone || deliveryAddress?.phone || req.user?.phone || '',
      addressType: deliveryAddress?.addressType || 'Home'
    };

    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      deliveryAddress: mappedDeliveryAddress,
      couponCode,
      couponDiscount: discount,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Placed'
    });

    const savedOrder = await order.save();

    // 2. Reduce Stock in Inventory & Product Collections
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { 
          $inc: { stockQuantity: -item.quantity },
          $push: {
            adjustments: {
              quantityChanged: -item.quantity,
              type: 'Sale',
              reason: `Order Placement (Local ID: ${savedOrder._id})`,
              adjustedBy: req.user._id
            }
          }
        }
      );
    }

    // Increment Coupon usages if code was valid
    if (couponCode && discount > 0) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }

    // 3. Create Payment ledger record
    await Payment.create({
      order: savedOrder._id,
      ccavenueOrderId: savedOrder._id.toString(),
      amount: totalAmount,
      status: 'Created'
    });

    // 4. Prepare CCAvenue Payload
    const merchant_id = process.env.CCAVENUE_MERCHANT_ID || 'M_ID';
    const access_code = process.env.CCAVENUE_ACCESS_CODE || 'A_CODE';
    const working_key = process.env.CCAVENUE_WORKING_KEY || 'W_KEY';
    const redirect_url = process.env.CCAVENUE_REDIRECT_URL || 'http://localhost:7050/api/orders/ccavenue-callback';
    const cancel_url = process.env.CCAVENUE_CANCEL_URL || 'http://localhost:7050/api/orders/ccavenue-callback';

    const merchantData = `merchant_id=${merchant_id}&order_id=${savedOrder._id}&currency=INR&amount=${totalAmount}&redirect_url=${redirect_url}&cancel_url=${cancel_url}&language=EN&billing_name=${encodeURIComponent(mappedDeliveryAddress.name)}&billing_address=${encodeURIComponent(mappedDeliveryAddress.address)}&billing_city=${encodeURIComponent(mappedDeliveryAddress.city)}&billing_state=${encodeURIComponent(mappedDeliveryAddress.state)}&billing_zip=${mappedDeliveryAddress.pincode}&billing_country=India&billing_tel=${mappedDeliveryAddress.phone}`;

    const encRequest = encrypt(merchantData, working_key);

    await logActivity(req.user._id, 'CREATE_ORDER', `Created order ID: ${savedOrder._id}, initiating CCAvenue transaction`, req);

    res.status(201).json({
      success: true,
      order: savedOrder,
      encRequest,
      accessCode: access_code
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle CCAvenue Callback (Server-to-Server form post)
// @route   POST /api/orders/ccavenue-callback
// @access  Public
export const ccavenueCallback = async (req, res, next) => {
  try {
    const { encResp } = req.body;
    if (!encResp) {
      return res.status(400).send('Invalid response from CCAvenue');
    }

    const working_key = process.env.CCAVENUE_WORKING_KEY || 'W_KEY';
    let decryptedResp;
    try {
      decryptedResp = decrypt(encResp, working_key);
    } catch (err) {
      console.error('CCAvenue Decryption Error:', err);
      return res.status(400).send('Failed to decrypt CCAvenue response');
    }

    const params = new URLSearchParams(decryptedResp);
    const order_id = params.get('order_id');
    const tracking_id = params.get('tracking_id');
    const bank_ref_no = params.get('bank_ref_no');
    const order_status = params.get('order_status'); 
    const payment_mode = params.get('payment_mode');
    const failure_message = params.get('failure_message');

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const payment = await Payment.findOne({ ccavenueOrderId: order_id });

    if (order_status === 'Success') {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.confirmedAt = Date.now();
      order.ccavenueTrackingId = tracking_id;
      order.ccavenueBankRefNo = bank_ref_no;
      order.paymentMode = payment_mode;
      await order.save();

      if (payment) {
        payment.status = 'Captured';
        payment.ccavenueTrackingId = tracking_id;
        payment.ccavenueBankRefNo = bank_ref_no;
        payment.paymentMode = payment_mode;
        payment.encResponse = encResp;
        await payment.save();
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/user/orders/${order._id}?success=true`);
    } else {
      order.paymentStatus = 'Failed';
      order.ccavenueTrackingId = tracking_id;
      order.ccavenueBankRefNo = bank_ref_no;
      order.paymentMode = payment_mode;
      await order.save();

      if (payment) {
        payment.status = 'Failed';
        payment.ccavenueTrackingId = tracking_id;
        payment.ccavenueBankRefNo = bank_ref_no;
        payment.paymentMode = payment_mode;
        payment.failureMessage = failure_message;
        payment.encResponse = encResp;
        await payment.save();
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Payment Failure Stock Restoral (Order ID: ${order._id})`,
                adjustedBy: order.user
              }
            }
          }
        );
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent(failure_message || 'Payment Failed')}`);
    }
  } catch (error) {
    console.error('CCAvenue Callback Error:', error);
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'images name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'images name')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow customer to fetch their own orders, or Staff/Manager/Admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'Customer') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin views)
// @route   GET /api/orders
// @access  Private/Admin/Manager/Staff
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Manager/Staff
export const updateOrderStatus = async (req, res, next) => {
  const { status, trackingNumber } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restrict cancellation if already shipped/delivered
    if (status === 'Cancelled' && ['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order that has already been shipped or delivered' });
    }

    const updateQuery = { $set: {} };
    updateQuery.$set.orderStatus = status || order.orderStatus;
    
    if (trackingNumber) updateQuery.$set.trackingNumber = trackingNumber;
    
    if (status === 'Confirmed') updateQuery.$set.confirmedAt = Date.now();
    if (status === 'Packed') updateQuery.$set.packedAt = Date.now();
    if (status === 'Shipped') updateQuery.$set.shippedAt = Date.now();
    if (status === 'Delivered') updateQuery.$set.deliveredAt = Date.now();

    // If Order is Cancelled, restore items to stock
    if (status === 'Cancelled') {
      updateQuery.$set.paymentStatus = 'Refunded';
      
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Order Cancellation (ID: ${order._id})`,
                adjustedBy: req.user._id
              }
            }
          }
        );
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateQuery, { new: true });
    await logActivity(req.user._id, 'UPDATE_ORDER_STATUS', `Updated order ID ${order._id} status to: ${status}`, req);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
export const processRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Order cannot be refunded because it is not in Paid status' });
    }

    const payment = await Payment.findOne({ order: order._id });

    if (!payment) {
      return res.status(400).json({ success: false, message: 'Transaction record missing' });
    }

    // CCAvenue refunds are typically initiated from the merchant dashboard manually
    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: 'MANUAL_CCAVENUE_REFUND_' + Date.now(),
      amount: order.totalAmount,
      reason: 'Admin Initiated Refund',
      processedAt: new Date()
    };
    await payment.save();

    const updateQuery = {
      $set: {
        paymentStatus: 'Refunded',
        orderStatus: 'Cancelled'
      }
    };
    await Order.findByIdAndUpdate(order._id, updateQuery);

    await logActivity(req.user._id, 'PROCESS_REFUND', `Processed manual refund record for Order ID ${order._id}`, req);

    res.json({ success: true, message: 'Refund recorded successfully. Note: You must actually initiate the refund in your CCAvenue Dashboard.', order });
  } catch (error) {
    next(error);
  }
};
