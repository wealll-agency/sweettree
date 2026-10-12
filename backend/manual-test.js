import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const uri = 'mongodb://gopalpaulwealll_db_user:J0TfcbZPgoYRdjjc@ac-ycds85j-shard-00-00.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-01.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-02.7o9xg3i.mongodb.net:27017/sweettree?ssl=true&replicaSet=atlas-5d5atu-shard-0&authSource=admin&retryWrites=true&w=majority';
const secret = 'd4bd4e9fcd37eb42e0fcbcc6cea36b03ef3dd43bfa1b38e4d72876726bd3f2015404e9fe024780c4dec6611e3a8f807de9f0d9074326f77eeca42effa483a0a8';

async function run() {
  await mongoose.connect(uri);
  
  // 1. Find an order that is Placed/Confirmed
  const pendingOrder = await mongoose.connection.db.collection('orders').findOne({ orderStatus: { $in: ['Placed', 'Confirmed'] } });
  
  if (pendingOrder) {
    const user = await mongoose.connection.db.collection('users').findOne({ _id: pendingOrder.user });
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '1d' });
    console.log('--- TEST 1: Cancel Pending Order ---');
    console.log('Order:', pendingOrder._id.toString(), 'Status:', pendingOrder.orderStatus);
    const res = await fetch(`http://localhost:7050/api/refunds/request/${pendingOrder._id.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Changed my mind' })
    });
    console.log('Status:', res.status, await res.json());
  }

  // 2. Find an order that is Packed/Shipped
  const packedOrder = await mongoose.connection.db.collection('orders').findOne({ orderStatus: { $in: ['Packed', 'Shipped'] } });
  
  if (packedOrder) {
    const user = await mongoose.connection.db.collection('users').findOne({ _id: packedOrder.user });
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '1d' });
    console.log('--- TEST 2: Cancel Packed Order ---');
    console.log('Order:', packedOrder._id.toString(), 'Status:', packedOrder.orderStatus);
    const res = await fetch(`http://localhost:7050/api/refunds/request/${packedOrder._id.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Cancel this please' })
    });
    console.log('Status:', res.status, await res.json());
  }

  // 3. Find an order that is Delivered
  const deliveredOrder = await mongoose.connection.db.collection('orders').findOne({ orderStatus: 'Delivered' });
  
  if (deliveredOrder) {
    const user = await mongoose.connection.db.collection('users').findOne({ _id: deliveredOrder.user });
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '1d' });
    console.log('--- TEST 3: Refund Delivered Order ---');
    console.log('Order:', deliveredOrder._id.toString(), 'Status:', deliveredOrder.orderStatus);
    const res = await fetch(`http://localhost:7050/api/refunds/request/${deliveredOrder._id.toString()}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Defective item' })
    });
    console.log('Status:', res.status, await res.json());
  }

  process.exit(0);
}

run().catch(console.error);
