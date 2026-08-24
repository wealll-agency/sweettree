import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    required: true,
    enum: ['Hero', 'Middle', 'Bottom', 'Promotional', 'ComboBox', 'AboutHero', 'AboutStory', 'AboutMission', 'AboutVision']
  },
  targetLink: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
