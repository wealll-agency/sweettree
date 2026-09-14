const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./src/models/Order.js').default;

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sweettree:sweettree123@cluster0.7o9xg3i.mongodb.net/sweettree?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const orders = await Order.find({ paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } });
  console.log('Paid non-cancelled orders:');
  orders.forEach(o => console.log(o._id, o.totalAmount, o.orderStatus, o.createdAt));
  let sum = 0;
  orders.forEach(o => sum += o.totalAmount);
  console.log('Total:', sum);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
