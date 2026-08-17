import mongoose from 'mongoose';

const customSectionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Section title is required'], 
    trim: true,
    unique: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  order: { 
    type: Number, 
    default: 0 
  },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }]
}, {
  timestamps: true
});

const CustomSection = mongoose.model('CustomSection', customSectionSchema);
export default CustomSection;
