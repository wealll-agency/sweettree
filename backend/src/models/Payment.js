import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  merchantTranId: { type: String, required: true, unique: true },
  gatewayTxnId: { type: String },
  bankRefNo: { type: String },
  paymentMode: { type: String },
  encResponse: { type: String },
  failureMessage: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['Created', 'Captured', 'Failed', 'Refunded'],
    default: 'Created'
  },
  refundDetails: {
    refundId: { type: String },
    amount: { type: Number },
    reason: { type: String },
    processedAt: { type: Date }
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
