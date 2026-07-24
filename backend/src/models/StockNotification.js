import mongoose from 'mongoose';

const stockNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, {
  timestamps: true
});

stockNotificationSchema.index({ product: 1, user: 1 }, { unique: true });

const StockNotification = mongoose.model('StockNotification', stockNotificationSchema);
export default StockNotification;
