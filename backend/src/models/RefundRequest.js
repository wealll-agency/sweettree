import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Refunded', 'Rejected'],
    default: 'Pending'
  },
  reason: { type: String, required: true },
  customerComment: { type: String },
  adminComment: { type: String },
  images: [{ type: String }],
  amount: { type: Number, required: true }
}, {
  timestamps: true
});

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
export default RefundRequest;
