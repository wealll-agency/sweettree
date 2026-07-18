import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  delhiveryPickupLocationName: { type: String, required: true, trim: true }, // Registered name in Delhivery
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactPersonName: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  returnSameAsPickup: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
