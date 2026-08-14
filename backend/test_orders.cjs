const mongoose = require('mongoose');
const Order = require('./src/models/Order.js').default || require('./src/models/Order.js');
const dotenv = require('dotenv');

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  const orders = await Order.find({ paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' }, createdAt: { $gte: startOfYear } });
  console.log('Orders this year:', orders.length);
  if(orders.length > 0) {
    console.log('Sample date:', orders[0].createdAt);
  }
  
  const allOrders = await Order.find({});
  console.log('Total orders in DB:', allOrders.length);
  if (allOrders.length > 0) {
    console.log('Sample order dates:', allOrders.slice(0, 3).map(o => o.createdAt));
    console.log('Sample payment status:', allOrders[0].paymentStatus);
  }
  
  process.exit();
}

test();
