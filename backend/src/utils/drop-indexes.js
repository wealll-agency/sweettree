import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function dropIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('Dropping old CCAvenue indexes from Payments collection...');
    const Payment = mongoose.connection.collection('payments');
    try { await Payment.dropIndex('ccavenueOrderId_1'); console.log('Dropped ccavenueOrderId_1'); } catch (e) { console.log('Index ccavenueOrderId_1 not found'); }
    try { await Payment.dropIndex('ccavenueTrackingId_1'); console.log('Dropped ccavenueTrackingId_1'); } catch (e) { console.log('Index ccavenueTrackingId_1 not found'); }
    try { await Payment.dropIndex('ccavenueBankRefNo_1'); console.log('Dropped ccavenueBankRefNo_1'); } catch (e) { console.log('Index ccavenueBankRefNo_1 not found'); }

    console.log('Dropping old CCAvenue indexes from Orders collection...');
    const Order = mongoose.connection.collection('orders');
    try { await Order.dropIndex('ccavenueTrackingId_1'); console.log('Dropped ccavenueTrackingId_1'); } catch (e) { console.log('Index ccavenueTrackingId_1 not found'); }
    try { await Order.dropIndex('ccavenueBankRefNo_1'); console.log('Dropped ccavenueBankRefNo_1'); } catch (e) { console.log('Index ccavenueBankRefNo_1 not found'); }

    console.log('Successfully dropped old legacy indexes.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropIndexes();
