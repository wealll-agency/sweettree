import mongoose from 'mongoose';
import Order from './src/models/Order.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Adjust if .env is in backend

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sweettree');
    
    const allOrders = await Order.find({});
    console.log('Total orders in DB:', allOrders.length);
    if (allOrders.length > 0) {
      console.log('Sample order dates:', allOrders.slice(0, 5).map(o => o.createdAt));
      console.log('Sample payment status:', allOrders.slice(0, 5).map(o => o.paymentStatus));
      console.log('Sample amounts:', allOrders.slice(0, 5).map(o => o.totalAmount));
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

test();
