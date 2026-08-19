const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/sweettree').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('coupons').updateMany({}, { $set: { minPurchaseAmount: 1000 } });
  console.log('Updated coupons');
  process.exit();
}).catch(console.error);
