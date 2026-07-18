import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import SystemSetting from './models/SystemSetting.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  await connectDB();
  
  // Set COD to false globally
  await SystemSetting.findOneAndUpdate(
    { key: 'cod' },
    { value: false },
    { upsert: true, new: true }
  );

  console.log('Successfully set COD to false globally in database.');
  
  // Check settings
  const codSetting = await SystemSetting.findOne({ key: 'cod' });
  console.log('Current COD setting:', codSetting);

  await mongoose.connection.close();
}

run();
