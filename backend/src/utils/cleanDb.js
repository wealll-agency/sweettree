import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';

dotenv.config({ path: '../.env' });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const realOrders = await Order.find({ 
      gatewayTxnId: { $exists: true, $ne: null, $not: /mock/i },
      paymentStatus: { $ne: 'Failed' }
    });
    
    console.log(`Found ${realOrders.length} REAL orders.`);

    const dummyOrdersCount = await Order.countDocuments({
      $or: [
        { gatewayTxnId: { $exists: false } },
        { gatewayTxnId: null },
        { gatewayTxnId: /mock/i },
        { paymentStatus: 'Failed' }
      ]
    });

    console.log(`Found ${dummyOrdersCount} DUMMY orders.`);

    if (process.argv[2] === 'execute') {
      const result = await Order.deleteMany({
        $or: [
          { gatewayTxnId: { $exists: false } },
          { gatewayTxnId: null },
          { gatewayTxnId: /mock/i },
          { paymentStatus: 'Failed' }
        ]
      });
      console.log(`Deleted ${result.deletedCount} dummy orders.`);

      // Find real customers (those with real orders)
      const usersWithRealOrders = await Order.distinct('user', { 
        gatewayTxnId: { $exists: true, $ne: null, $not: /mock/i },
        paymentStatus: { $ne: 'Failed' }
      });
      
      // Delete users who do NOT have real orders AND who are just 'Customer' role
      const dummyUsersResult = await User.deleteMany({
        _id: { $nin: usersWithRealOrders },
        role: 'Customer',
      });
      console.log(`Deleted ${dummyUsersResult.deletedCount} dummy customers.`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
