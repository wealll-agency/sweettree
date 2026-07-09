import RefundRequest from '../models/RefundRequest.js';
import Order from '../models/Order.js';

// @desc    Get all refund requests (with optional status filter)
// @route   GET /api/refunds
// @access  Private/Admin
export const getRefundRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const refunds = await RefundRequest.find(filter)
      .populate('user', 'name email phone')
      .populate({
        path: 'order',
        select: 'items totalAmount paymentStatus trackingNumber orderStatus',
        populate: {
          path: 'items.product',
          select: 'name price image'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, refunds });
  } catch (error) {
    next(error);
  }
};

// @desc    Update refund request status
// @route   PUT /api/refunds/:id/status
// @access  Private/Admin
export const updateRefundStatus = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    const refund = await RefundRequest.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    refund.status = status || refund.status;
    if (adminComment) {
      refund.adminComment = adminComment;
    }

    await refund.save();

    // If marked as refunded, also update the order payment status
    if (status === 'Refunded') {
      const order = await Order.findById(refund.order);
      if (order) {
        order.paymentStatus = 'Refunded';
        await order.save();
      }
    }

    const updatedRefund = await RefundRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('order', 'items totalAmount paymentStatus trackingNumber orderStatus');

    res.json({ success: true, refund: updatedRefund });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a mock refund request (for testing/development)
// @route   POST /api/refunds/mock
// @access  Private/Admin
export const createMockRefundRequest = async (req, res, next) => {
  try {
    const { orderId, userId, reason, amount, customerComment, status } = req.body;
    
    const refund = new RefundRequest({
      order: orderId,
      user: userId,
      reason,
      amount,
      customerComment,
      status: status || 'Pending'
    });

    await refund.save();
    res.status(201).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};
