import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

// Check if coupon is valid helper
couponSchema.methods.isValid = function () {
  return this.isActive && this.expiryDate > new Date() && this.usageCount < this.usageLimit;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
