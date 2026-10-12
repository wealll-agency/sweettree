const mongoose = require('mongoose');

mongoose.connect('mongodb://gopalpaulwealll_db_user:J0TfcbZPgoYRdjjc@ac-ycds85j-shard-00-00.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-01.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-02.7o9xg3i.mongodb.net:27017/sweettree?ssl=true&replicaSet=atlas-5d5atu-shard-0&authSource=admin&retryWrites=true&w=majority').then(async () => {
  const payments = await mongoose.connection.db.collection('payments').find({ status: 'Failed' }).toArray();
  let updatedCount = 0;
  for (const p of payments) {
    if (p.encResponse && (p.encResponse.includes('E000') || p.encResponse.includes('Success'))) {
      console.log('Fixing payment:', p._id, 'Order:', p.order);
      await mongoose.connection.db.collection('payments').updateOne({ _id: p._id }, { $set: { status: 'Captured' } });
      await mongoose.connection.db.collection('orders').updateOne({ _id: p.order }, { $set: { paymentStatus: 'Paid', orderStatus: 'Confirmed', confirmedAt: Date.now() } });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} old successful transactions.`);
  process.exit(0);
});
