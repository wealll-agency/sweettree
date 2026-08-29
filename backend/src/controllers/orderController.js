import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import Order from '../models/Order.js';
import SystemSetting from '../models/SystemSetting.js';
import Product from '../models/Product.js';
import Combo from '../models/Combo.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import { logActivity } from '../middleware/logger.js';
import { generateICICISecureHash, verifyICICISecureHash, processICICIRefund } from '../services/iciciService.js';

// ICICI configuration will be drawn directly from environment variables
// Helper: Calculate order totals
const calculateOrderTotals = async (items, couponCode) => {
  let subtotal = 0;
  
  const productIds = items.filter(i => i.itemType !== 'Combo').map(i => i.product);
  const comboIds = items.filter(i => i.itemType === 'Combo').map(i => i.combo);
  
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const combos = await Combo.find({ _id: { $in: comboIds } }).populate('components.product').lean();
  
  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});
  
  const comboMap = combos.reduce((acc, combo) => {
    acc[combo._id.toString()] = combo;
    return acc;
  }, {});

  for (const item of items) {
    if (item.itemType === 'Combo') {
      if (!mongoose.isValidObjectId(item.combo)) {
        const err = new Error(`Invalid combo ID format for: ${item.name}`);
        err.statusCode = 400;
        throw err;
      }
      const combo = comboMap[item.combo.toString()];
      if (!combo) throw new Error(`Combo not found: ${item.name}`);
      if (combo.status !== 'Active') throw new Error(`Combo is currently unavailable: ${combo.name}`);
      
      let availableComboStock = Infinity;
      const componentsSnapshot = [];
      for (const comp of combo.components) {
        if (!comp.product) throw new Error(`A component for ${combo.name} is missing or deleted.`);
        const stock = comp.product.stock || 0;
        const possibleCombos = Math.floor(stock / comp.quantity);
        if (possibleCombos < availableComboStock) availableComboStock = possibleCombos;
        
        componentsSnapshot.push({
          product: comp.product._id,
          name: comp.product.name,
          size: comp.size,
          quantity: comp.quantity
        });
      }
      
      if (availableComboStock < item.quantity) {
        throw new Error(`Insufficient stock for combo ${combo.name}. Available: ${availableComboStock}`);
      }
      
      item.comboComponentsSnapshot = componentsSnapshot;
      item.price = combo.comboPrice;
      subtotal += item.price * item.quantity;
      
    } else {
      if (!mongoose.isValidObjectId(item.product)) {
        const err = new Error(`Invalid product ID format for: ${item.name}`);
        err.statusCode = 400;
        throw err;
      }
      const product = productMap[item.product.toString()];
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }
      
      let basePrice = product.price;
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
      item.price = activePrice;
    }
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid()) {
      // M1 Fix: Ensure the current subtotal meets the coupon's minimum purchase requirement
      if (!coupon.minPurchaseAmount || subtotal >= coupon.minPurchaseAmount) {
        if (coupon.discountType === 'flat') {
          discount = Math.min(coupon.flatDiscountAmount || 0, subtotal);
        } else {
          discount = Math.round((subtotal * (coupon.discountPercentage || 0)) / 100);
        }
      }
    }
  }

  // Tax = 5% of discounted price
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.05);
  
  // Shipping: Free above 1999, else To be calculated (Set to 0 for now)
  const shippingFee = 0; // taxableAmount >= 1999 ? 0 : 80;
  
  const totalAmount = taxableAmount + tax + shippingFee;

  return { subtotal, discount, tax, shippingFee, totalAmount, validatedItems: items };
};

// @desc    Create a new order & initiate Razorpay payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, deliveryAddress, couponCode, paymentMode = 'ICICI' } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (paymentMode === 'COD') {
      const codSetting = await SystemSetting.findOne({ key: 'cod' }).session(session);
      const hasCodPermission = codSetting ? codSetting.value : true;
      if (!hasCodPermission) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ success: false, message: 'Cash on Delivery (COD) is currently disabled globally.' });
      }
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
      paymentMode,
      paymentStatus: 'Pending',
      orderStatus: 'Placed'
    });

    const savedOrder = await order.save({ session });

    // 2. Reduce Stock in Inventory & Product Collections
    for (const item of validatedItems) {
      if (item.itemType === 'Combo') {
        for (const comp of item.comboComponentsSnapshot) {
          const deductQty = comp.quantity * item.quantity;
          await Product.findByIdAndUpdate(comp.product, { $inc: { stock: -deductQty, totalSold: deductQty } }, { runValidators: true, session });
          const updatedInv = await Inventory.findOneAndUpdate(
            { product: comp.product },
            { 
              $inc: { stockQuantity: -deductQty },
              $push: {
                adjustments: {
                  quantityChanged: -deductQty,
                  type: 'Sale',
                  reason: `Combo Order Placement (Local ID: ${savedOrder._id}, Combo: ${item.name})`,
                  adjustedBy: req.user._id
                }
              }
            },
            { new: true, runValidators: true, session }
          );
          if (updatedInv && updatedInv.stockQuantity <= updatedInv.lowStockThreshold) {
            updatedInv.adminRead = false;
            await updatedInv.save({ session });
          }
        }
      } else {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } }, { runValidators: true, session });
        const updatedInv = await Inventory.findOneAndUpdate(
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
          },
          { new: true, runValidators: true, session }
        );
        if (updatedInv && updatedInv.stockQuantity <= updatedInv.lowStockThreshold) {
          updatedInv.adminRead = false;
          await updatedInv.save({ session });
        }
      }
    }

    // Increment Coupon usages if code was valid
    if (couponCode && discount > 0) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } },
        { session }
      );
    }

    const merchantTranId = crypto.randomBytes(10).toString('hex');

    // If COD, we can skip ICICI processing
    if (paymentMode === 'COD') {
      await Payment.create([{
        order: savedOrder._id,
        merchantTranId: `COD-${merchantTranId}`,
        amount: totalAmount,
        status: 'Created',
        paymentMode: 'COD'
      }], { session });

      await logActivity(req.user._id, 'CREATE_ORDER', `Created COD order ID: ${savedOrder._id}`, req);

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        order: savedOrder,
        message: 'Order placed successfully'
      });
    }

    // 3. Create Payment ledger record for ICICI
    await Payment.create([{
      order: savedOrder._id,
      merchantTranId,
      amount: totalAmount,
      status: 'Created'
    }], { session });

    // 4. Prepare ICICI Payload for S2S
    const merchantId = process.env.ICICI_MERCHANT_ID || '100000000007164';
    const aggregatorID = 'A' + merchantId; // Typical convention or hardcoded to what we found
    const hostUrl = process.env.API_BASE_URL || `https://www.sweettreeon.com`;
    const returnURL = process.env.ICICI_RETURN_URL || `${hostUrl}/api/orders/icici-callback`;
    const actionUrl = process.env.ICICI_INITIATE_SALE_URL || 'https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale';
    
    const iciciPayload = {
      addlParam1: "000",
      addlParam2: "111",
      aggregatorID: 'A' + merchantId.substring(1), // usually 'A' + merchantId or specific provided
      amount: Number(totalAmount).toFixed(2),
      currencyCode: "356", // INR
      customerEmailID: req.user.email || "test@gmail.com",
      customerMobileNo: String(req.user.phone || "9999999999").replace(/\D/g, '').substring(0, 10),
      customerName: String(req.user.name || "Customer").replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20),
      merchantId: merchantId,
      merchantTxnNo: merchantTranId, // Changed to merchantTxnNo per docs
      payType: '0', // 0 = Redirect to gateway
      returnURL: returnURL,
      transactionType: "SALE",
      txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14) // YYYYMMDDHHMMSS
    };

    // Override aggregatorID if the user gave us one specifically (A1000...)
    if (merchantId === "100000000007164") {
      iciciPayload.aggregatorID = "A100000000007164";
    }

    // Generate Secure Hash
    iciciPayload.secureHash = generateICICISecureHash(iciciPayload);

    await logActivity(req.user._id, 'CREATE_ORDER', `Created order ID: ${savedOrder._id}, initiating ICICI S2S payment`, req);

    await session.commitTransaction();
    session.endSession();

    // 5. Make S2S Call to ICICI Gateway
    try {
      const iciciResponse = await axios.post(actionUrl, iciciPayload, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("ICICI S2S Response:", iciciResponse.data);

      if (iciciResponse.data && (iciciResponse.data.responseCode === '0000' || iciciResponse.data.responseCode === 'R1000')) {
        let paymentUrl = iciciResponse.data.paymentUrl || iciciResponse.data.redirectURI;
        if (paymentUrl && iciciResponse.data.tranCtx && !paymentUrl.includes('tranCtx')) {
          paymentUrl += (paymentUrl.includes('?') ? '&' : '?') + 'tranCtx=' + iciciResponse.data.tranCtx;
        }
        
        if (paymentUrl) {
          return res.status(201).json({
            success: true,
            order: savedOrder,
            iciciActionUrl: paymentUrl
          });
        }
      }
      
      // Fallback/Error
      return res.status(201).json({
        success: true,
        order: savedOrder,
        iciciActionUrl: null,
        gatewayError: iciciResponse.data.responseDescription || 'Payment Gateway Error'
      });

    } catch (apiError) {
      console.error("ICICI S2S API Error:", apiError.response?.data || apiError.message);
      return res.status(201).json({
        success: true,
        order: savedOrder,
        iciciActionUrl: null,
        gatewayError: apiError.response?.data?.responseDescription || 'Failed to connect to ICICI Gateway'
      });
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

// @desc    Handle ICICI Callback (Server-to-Server form post from ICICI gateway)
// @route   POST /api/orders/icici-callback
// @access  Public
export const iciciCallback = async (req, res, next) => {
  let session;
  try {
    const responseParams = req.body;
    
    // Safely extract the primary frontend URL early for error redirects
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7051';
    if (frontendUrl.includes(',')) {
      frontendUrl = frontendUrl.split(',')[0].trim();
    }

    if (!responseParams || Object.keys(responseParams).length === 0) {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Invalid response from Payment Gateway')}`);
    }

    // Verify Hash
    const isValidHash = verifyICICISecureHash(responseParams);
    if (!isValidHash) {
      console.error('ICICI Hash Verification Failed:', responseParams);
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Payment verification failed (Hash Mismatch)')}`);
    }

    const amount = responseParams.amount || responseParams.Amount;
    const responseCode = responseParams.responseCode || responseParams.ResponseCode;
    const txnId = responseParams.txnID || responseParams.txnId || responseParams.TxnId;
    const bankRefNo = responseParams.bankRefNo || responseParams.BankRefNo;
    const message = responseParams.respDescription || responseParams.message || responseParams.Message;
    const merchantTranId = responseParams.merchantTxnNo || responseParams.MerchantTxnNo || responseParams.merchantTranId;

    if (!merchantTranId) {
      console.error('Missing Transaction ID in callback:', responseParams);
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Missing transaction ID from payment gateway')}`);
    }

    // Find the payment ledger entry first
    const payment = await Payment.findOne({ merchantTranId });
    if (!payment) {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Transaction not found.')}`);
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Order not found.')}`);
    }

    // Idempotency: Prevent duplicate processing
    if (order.paymentStatus === 'Paid') {
      return res.redirect(`${frontendUrl}/user/orders/${order._id}?success=true`);
    }
    if (order.paymentStatus === 'Failed' && ResponseCode !== '0000') {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent(message || 'Payment Failed')}`);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // Re-fetch with session
    const lockedPayment = await Payment.findById(payment._id).session(session);
    const lockedOrder = await Order.findById(order._id).session(session);

    // ICICI Success ResponseCode is typically '0000' (or '0' depending on exact spec). Assuming '0000'.
    if (responseCode === '0000' || responseCode === '0') {
      // Validate amount
      if (Number(amount) !== Number(lockedOrder.totalAmount)) {
        lockedOrder.paymentStatus = 'Failed';
        lockedOrder.gatewayTxnId = txnId;
        lockedOrder.bankRefNo = bankRefNo;
        lockedOrder.paymentMode = 'ICICI';
        await lockedOrder.save({ session });

        lockedPayment.status = 'Failed';
        lockedPayment.gatewayTxnId = txnId;
        lockedPayment.bankRefNo = bankRefNo;
        lockedPayment.paymentMode = 'ICICI';
        lockedPayment.failureMessage = `Amount mismatch (Paid: ${amount}, Expected: ${lockedOrder.totalAmount})`;
        lockedPayment.encResponse = JSON.stringify(responseParams);
        await lockedPayment.save({ session });

        // Restore stock
        for (const item of lockedOrder.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true, session });
          await Inventory.findOneAndUpdate(
            { product: item.product },
            { 
              $inc: { stockQuantity: item.quantity },
              $push: {
                adjustments: {
                  quantityChanged: item.quantity,
                  type: 'AuditAdjustment',
                  reason: `Amount Mismatch Stock Restoral (Order ID: ${lockedOrder._id})`,
                  adjustedBy: lockedOrder.user
                }
              }
            },
            { runValidators: true, session }
          );
        }

        await session.commitTransaction();
        session.endSession();
        return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Payment failed due to amount mismatch. Please contact support.')}`);
      }

      // Success Path
      lockedOrder.paymentStatus = 'Paid';
      lockedOrder.orderStatus = 'Confirmed';
      lockedOrder.confirmedAt = Date.now();
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Captured';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/user/orders/${lockedOrder._id}?success=true`);
      
    } else {
      // Failure Path
      lockedOrder.paymentStatus = 'Failed';
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Failed';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.failureMessage = message || 'Payment Failed';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      // Restore stock
      for (const item of lockedOrder.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true, session });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Payment Failure Stock Restoral (Order ID: ${lockedOrder._id})`,
                adjustedBy: lockedOrder.user
              }
            }
          },
          { runValidators: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent(message || 'Payment Failed')}`);
    }

  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    console.error('ICICI Callback Error:', error);
    
    let fUrl = process.env.FRONTEND_URL || 'http://localhost:7051';
    if (fUrl.includes(',')) fUrl = fUrl.split(',')[0].trim();
      return res.redirect(`${fUrl}/checkout?error=${encodeURIComponent('Payment processing failed due to an internal server error.')}`);
  }
};

// @desc    Handle ICICI Payment Advice (Server-to-Server webhook)
// @route   POST /api/orders/icici-advice
// @access  Public
export const iciciAdvice = async (req, res, next) => {
  let session;
  try {
    const responseParams = req.body;
    
    if (!responseParams || Object.keys(responseParams).length === 0) {
      return res.status(400).send('Invalid advice payload');
    }

    const isValidHash = verifyICICISecureHash(responseParams);
    if (!isValidHash) {
      return res.status(400).send('Hash Mismatch');
    }

    const amount = responseParams.amount || responseParams.Amount;
    const responseCode = responseParams.responseCode || responseParams.ResponseCode;
    const txnId = responseParams.txnID || responseParams.txnId || responseParams.TxnId;
    const bankRefNo = responseParams.bankRefNo || responseParams.BankRefNo;
    const message = responseParams.respDescription || responseParams.message || responseParams.Message;
    const merchantTranId = responseParams.merchantTxnNo || responseParams.MerchantTxnNo || responseParams.merchantTranId;

    if (!merchantTranId) {
      return res.status(400).send('Missing transaction ID');
    }

    const payment = await Payment.findOne({ merchantTranId });
    if (!payment) {
      return res.status(404).send('Transaction not found');
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(200).send('OK');
    }
    if (order.paymentStatus === 'Failed' && ResponseCode !== '0000') {
      return res.status(200).send('OK');
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const lockedPayment = await Payment.findById(payment._id).session(session);
    const lockedOrder = await Order.findById(order._id).session(session);

    if (responseCode === '0000' || responseCode === '0') {
      if (Number(amount) !== Number(lockedOrder.totalAmount)) {
        lockedOrder.paymentStatus = 'Failed';
        lockedOrder.gatewayTxnId = txnId;
        lockedOrder.bankRefNo = bankRefNo;
        lockedOrder.paymentMode = 'ICICI';
        await lockedOrder.save({ session });

        lockedPayment.status = 'Failed';
        lockedPayment.gatewayTxnId = txnId;
        lockedPayment.bankRefNo = bankRefNo;
        lockedPayment.paymentMode = 'ICICI';
        lockedPayment.failureMessage = `Amount mismatch (Paid: ${amount}, Expected: ${lockedOrder.totalAmount})`;
        lockedPayment.encResponse = JSON.stringify(responseParams);
        await lockedPayment.save({ session });

        for (const item of lockedOrder.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true, session });
          await Inventory.findOneAndUpdate(
            { product: item.product },
            { 
              $inc: { stockQuantity: item.quantity },
              $push: {
                adjustments: {
                  quantityChanged: item.quantity,
                  type: 'AuditAdjustment',
                  reason: `Amount Mismatch Stock Restoral (Order ID: ${lockedOrder._id})`,
                  adjustedBy: lockedOrder.user
                }
              }
            },
            { runValidators: true, session }
          );
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).send('OK');
      }

      lockedOrder.paymentStatus = 'Paid';
      lockedOrder.orderStatus = 'Confirmed';
      lockedOrder.confirmedAt = Date.now();
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Captured';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      await session.commitTransaction();
      session.endSession();
      return res.status(200).send('OK');
      
    } else {
      lockedOrder.paymentStatus = 'Failed';
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Failed';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.failureMessage = message || 'Payment Failed';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      for (const item of lockedOrder.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true, session });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Payment Failure Stock Restoral (Order ID: ${lockedOrder._id})`,
                adjustedBy: lockedOrder.user
              }
            }
          },
          { runValidators: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).send('OK');
    }
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    console.error('ICICI Advice Error:', error);
    return res.status(500).send('Internal Server Error');
  }
};



// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'images name')
      .populate('items.combo', 'image name')
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
      .populate('items.combo', 'image name')
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

    // Removed restriction to allow Admins to force-cancel orders at any stage


    const updateQuery = { $set: {} };
    updateQuery.$set.orderStatus = status || order.orderStatus;
    
    if (trackingNumber) updateQuery.$set.trackingNumber = trackingNumber;
    
    if (status === 'Confirmed') updateQuery.$set.confirmedAt = Date.now();
    if (status === 'Packed') updateQuery.$set.packedAt = Date.now();
    if (status === 'Shipped') updateQuery.$set.shippedAt = Date.now();
    if (status === 'Delivered') updateQuery.$set.deliveredAt = Date.now();

    // If Order is Cancelled, restore items to stock
    if (status === 'Cancelled') {
      
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true });
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
          },
          { runValidators: true }
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

// @desc    Mark order as read by admin
// @route   PATCH /api/orders/:id/read
// @access  Private/Admin/Manager/Staff
export const markOrderRead = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminRead: true },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
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

    // Call ICICI Refund API
    const refundResult = await processICICIRefund(
      'REF' + Date.now().toString(), 
      order.totalAmount, 
      payment.gatewayTxnId || payment.merchantTranId
    );

    if (!refundResult.success) {
      return res.status(400).json({ success: false, message: `Refund failed at gateway: ${refundResult.message}` });
    }

    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: refundResult.refundId,
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

    await logActivity(req.user._id, 'PROCESS_REFUND', `Processed refund via ICICI for Order ID ${order._id}`, req);

    res.json({ success: true, message: 'Refund recorded and processed successfully via ICICI Gateway.', order });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MOCK ICICI GATEWAY FOR LOCAL TESTING ONLY
// ==========================================
export const mockICICIGateway = (req, res) => {
  const { merchantId, merchantTranId, amount, returnUrl, secureHash } = req.body;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock ICICI Sandbox Gateway</title>
        <style>
          body { font-family: sans-serif; background: #f4f4f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          button { padding: 10px 20px; margin: 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
          .btn-success { background: #28a745; color: white; }
          .btn-danger { background: #dc3545; color: white; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>ICICI Mock Gateway</h2>
          <p>Merchant: ${merchantId}</p>
          <p>Order ID: ${merchantTranId}</p>
          <h3>Amount: ₹${amount}</h3>
          
          <form method="POST" action="/api/orders/mock-icici-process">
            <input type="hidden" name="merchantTranId" value="${merchantTranId}">
            <input type="hidden" name="amount" value="${amount}">
            <input type="hidden" name="returnUrl" value="${returnUrl}">
            <button type="submit" name="status" value="success" class="btn-success">Simulate Successful Payment</button>
            <button type="submit" name="status" value="failure" class="btn-danger">Simulate Failed Payment</button>
          </form>
        </div>
      </body>
    </html>
  `;
  res.send(html);
};

export const mockICICIProcess = (req, res) => {
  const { merchantTranId, amount, returnUrl, status } = req.body;
  
  const responseParams = {
    merchantId: process.env.ICICI_MERCHANT_ID || 'TEST_MERCHANT_123',
    merchantTranId: merchantTranId,
    amount: amount,
    ResponseCode: status === 'success' ? '0000' : 'E000',
    txnId: 'MOCK_TXN_' + Date.now(),
    bankRefNo: 'MOCK_BANK_' + Math.floor(Math.random() * 1000000),
    message: status === 'success' ? 'Transaction Successful' : 'Transaction Failed'
  };

  responseParams.secureHash = generateICICISecureHash(responseParams);

  const html = `
    <html>
      <body onload="document.forms[0].submit()">
        <p>Processing response to your website...</p>
        <form method="POST" action="${returnUrl}">
          ${Object.keys(responseParams).map(k => `<input type="hidden" name="${k}" value="${responseParams[k]}">`).join('')}
        </form>
      </body>
    </html>
  `;
  res.send(html);
};


// @desc    Get all shipments for admin panel
// @route   GET /api/orders/shipments
// @access  Private/Admin
export const getAdminShipments = async (req, res, next) => {
  try {
    const { pageNumber, keyword, status } = req.query;
    const page = Number(pageNumber) || 1;
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    const pipeline = [
      { $match: { 'shipments.0': { $exists: true } } },
      { $unwind: '$shipments' },
      { 
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          orderIdStr: { $toString: '$_id' }
        }
      },
      ...(status ? [{ $match: { 'shipments.status': status } }] : []),
      ...(keyword ? [{
        $match: {
          $or: [
            { 'shipments.waybill': { $regex: keyword, $options: 'i' } },
            { 'shipments.trackingId': { $regex: keyword, $options: 'i' } },
            { 'userDetails.name': { $regex: keyword, $options: 'i' } },
            { 'userDetails.phone': { $regex: keyword, $options: 'i' } },
            { 'deliveryAddress.phone': { $regex: keyword, $options: 'i' } },
            { 'orderIdStr': { $regex: keyword, $options: 'i' } }
          ]
        }
      }] : []),
      {
        $lookup: {
          from: 'warehouses',
          localField: 'shipments.warehouse',
          foreignField: '_id',
          as: 'warehouseDetails'
        }
      },
      { $unwind: { path: '$warehouseDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { 'shipments.shippedAt': -1, createdAt: -1 } },
      {
        $project: {
          _id: '$shipments._id',
          orderId: '$_id',
          customerName: { $ifNull: ['$userDetails.name', 'Guest'] },
          customerEmail: '$userDetails.email',
          deliveryAddress: '$deliveryAddress',
          orderDate: '$createdAt',
          paymentStatus: '$paymentStatus',
          waybill: '$shipments.waybill',
          trackingId: '$shipments.trackingId',
          status: '$shipments.status',
          courierName: '$shipments.courierName',
          shippedAt: '$shipments.shippedAt',
          warehouse: {
            _id: '$warehouseDetails._id',
            name: '$warehouseDetails.name',
            delhiveryPickupLocationName: '$warehouseDetails.delhiveryPickupLocationName'
          }
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: pageSize }]
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    
    const count = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const paginatedShipments = result[0].data;

    res.json({
      shipments: paginatedShipments,
      page,
      pages: Math.ceil(count / pageSize),
      totalShipments: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shipment details by waybill
// @route   GET /api/orders/shipments/:waybill
// @access  Private/Admin
export const getShipmentByWaybill = async (req, res, next) => {
  try {
    const { waybill } = req.params;
    const order = await Order.findOne({ 'shipments.waybill': waybill })
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku price images category')
      .populate('shipments.warehouse', 'name address city state pincode phone delhiveryPickupLocationName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const shipment = order.shipments.find(s => s.waybill === waybill);

    res.json({
      success: true,
      order: {
        _id: order._id,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        deliveryAddress: order.deliveryAddress,
        items: order.items,
        user: order.user,
        totalAmount: order.totalAmount
      },
      shipment
    });
  } catch (error) {
    next(error);
  }
};
