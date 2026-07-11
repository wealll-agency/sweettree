import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import { logActivity } from '../middleware/logger.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_T5pGWPZ0XxeNCx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'hqPKmC832Z20q2lfgwVowWoh'
});

// Helper: Calculate order totals
const calculateOrderTotals = async (items, couponCode) => {
  let subtotal = 0;
  
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product)) {
      const err = new Error(`Invalid product ID format for: ${item.name}`);
      err.statusCode = 400;
      throw err;
    }
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }
    
    // Check stock
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
    
    const activePrice = product.discount > 0 
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
      
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

  // Tax = 18% of discounted price
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.18);
  
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

    // 1. Initiate Razorpay Order Session FIRST to prevent inventory leaks if API fails
    const options = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}` // Generate temporary receipt ID
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpError) {
      // If Razorpay fails (e.g. 401 invalid keys), map it to 400 to prevent frontend from logging user out
      const err = new Error(`Payment Gateway Error: ${rzpError.error?.description || 'Failed to connect to Razorpay'}. Please verify your API keys.`);
      err.statusCode = 400; 
      throw err;
    }

    // 2. Create Local Order (Pending Payment)
    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      deliveryAddress,
      couponCode,
      couponDiscount: discount,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      razorpayOrderId: razorpayOrder.id
    });

    const savedOrder = await order.save();

    // 3. Reduce Stock in Inventory & Product Collections
    for (const item of validatedItems) {
      // Decrement Product stock
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      
      // Decrement Inventory stock and record audit adjustment
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

    // 4. Create Payment ledger record
    await Payment.create({
      order: savedOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      status: 'Created'
    });

    await logActivity(req.user._id, 'CREATE_ORDER', `Created order ID: ${savedOrder._id}, Razorpay Order: ${razorpayOrder.id}`, req);

    res.status(201).json({
      success: true,
      order: savedOrder,
      razorpayOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/orders/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '6SoTQA3cils25UsbCS6r0FoK');
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest === razorpaySignature) {
      // Payment Successful
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        { 
          $set: { 
            paymentStatus: 'Paid',
            orderStatus: 'Confirmed',
            razorpayPaymentId
          } 
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Associated order not found' });
      }

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { 
          $set: { 
            status: 'Captured',
            razorpayPaymentId,
            razorpaySignature
          } 
        }
      );

      await logActivity(req.user._id, 'VERIFY_PAYMENT', `Verified payment for Order ID: ${order._id}`, req);

      res.json({ success: true, message: 'Payment verified and captured', order });
    } else {
      // Payment Signature Check Failed
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        { $set: { paymentStatus: 'Failed' } },
        { new: true }
      );
      
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { $set: { status: 'Failed' } }
      );

      // Restore stocks since transaction failed
      if (order) {
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
                  adjustedBy: req.user._id
                }
              }
            }
          );
        }
      }

      res.status(400).json({ success: false, message: 'Invalid payment signature, transaction failed' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

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
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
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

    order.orderStatus = status || order.orderStatus;
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    if (status === 'Shipped') order.shippedAt = Date.now();
    if (status === 'Delivered') order.deliveredAt = Date.now();

    // If Order is Cancelled, restore items to stock
    if (status === 'Cancelled') {
      order.paymentStatus = 'Refunded';
      
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

    const updatedOrder = await order.save();
    await logActivity(req.user._id, 'UPDATE_ORDER_STATUS', `Updated order ID ${order._id} status to: ${status}`, req);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund via Razorpay
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

    if (!payment || !payment.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Razorpay transaction record missing' });
    }

    // Trigger Razorpay Refund
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: order.totalAmount * 100, // fully refund
      notes: { reason: 'Customer Cancelled/Admin Initiated Refund' }
    });

    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: refund.id,
      amount: order.totalAmount,
      reason: 'Admin Initiated Refund',
      processedAt: new Date()
    };
    await payment.save();

    order.paymentStatus = 'Refunded';
    order.orderStatus = 'Cancelled';
    await order.save();

    await logActivity(req.user._id, 'PROCESS_REFUND', `Processed refund for Order ID ${order._id}`, req);

    res.json({ success: true, message: 'Refund processed successfully', order });
  } catch (error) {
    next(error);
  }
};
