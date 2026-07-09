import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Percentage discount
  description: { type: String, required: true },
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  images: [{ type: String }],
  videos: [{ type: String }],
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 }
}, {
  timestamps: true
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Create text index for search
productSchema.index({ name: 'text', category: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
