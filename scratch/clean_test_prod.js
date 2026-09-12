import mongoose from 'mongoose';
import config from '../backend/src/config/env.js';
import Product from '../backend/src/models/Product.js';
import Inventory from '../backend/src/models/Inventory.js';

async function clean() {
  await mongoose.connect(config.MONGODB_URI);
  await Product.deleteOne({ name: 'Test Product With New Category' });
  await Inventory.deleteMany({ batchNumber: 'B123' });
  console.log('Cleanup complete');
  process.exit(0);
}
clean().catch(err => { console.error(err); process.exit(1); });
