import mongoose from 'mongoose';

const catalogLeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('CatalogLead', catalogLeadSchema);
