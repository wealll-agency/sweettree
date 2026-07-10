import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  queryType: { type: String, default: 'Order Related Queries' },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
