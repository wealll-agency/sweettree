import mongoose from 'mongoose';

const promotionalPopupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [80, 'Title cannot exceed 80 characters']
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
    maxlength: [160, 'Subtitle cannot exceed 160 characters']
  },
  badgeText: {
    type: String,
    default: '🎁 SURPRISE',
    trim: true,
    maxlength: [30, 'Badge text cannot exceed 30 characters']
  },
  image: {
    type: String,
    required: true
  },
  popupType: {
    type: String,
    enum: ['product', 'combo'],
    required: true
  },
  productRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  comboRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Combo',
    default: null
  },
  benefits: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) { return arr.length <= 5; },
      message: 'Maximum 5 benefits allowed'
    }
  },
  promoMessage: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Promo message cannot exceed 200 characters']
  },
  ctaText: {
    type: String,
    default: 'Add to Cart',
    trim: true,
    maxlength: [30, 'CTA text cannot exceed 30 characters']
  },
  viewMoreText: {
    type: String,
    default: 'View More',
    trim: true,
    maxlength: [30, 'View More text cannot exceed 30 characters']
  },
  isActive: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  displayDelayMs: {
    type: Number,
    default: 1500,
    min: [0, 'Delay cannot be negative'],
    max: [10000, 'Delay cannot exceed 10 seconds']
  },
  displayOncePerSession: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Compound index for fast public query: active + priority
promotionalPopupSchema.index({ isActive: 1, priority: -1 });

const PromotionalPopup = mongoose.model('PromotionalPopup', promotionalPopupSchema);
export default PromotionalPopup;
