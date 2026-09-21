import mongoose from 'mongoose';
import Order from './src/models/Order.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Warehouse from './src/models/Warehouse.js';

const MONGO_URI = 'mongodb://gopalpaulwealll_db_user:J0TfcbZPgoYRdjjc@ac-ycds85j-shard-00-00.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-01.7o9xg3i.mongodb.net:27017,ac-ycds85j-shard-00-02.7o9xg3i.mongodb.net:27017/sweettree?ssl=true&replicaSet=atlas-5d5atu-shard-0&authSource=admin&retryWrites=true&w=majority';

async function createDummyOrder() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get a user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      user = await User.create({
        name: 'Test Customer',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543210'
      });
    }

    // Get a product
    const product = await Product.findOne();
    if (!product) {
      throw new Error('No products found in DB');
    }

    // Get a warehouse
    const warehouse = await Warehouse.findOne();
    if (!warehouse) {
      throw new Error('No warehouses found in DB');
    }

    // Delete previous dummy orders
    await Order.deleteMany({ "deliveryAddress.name": "Test" });

    // Create order
    const order = new Order({
      user: user._id,
      items: [{
        itemType: 'Product',
        product: product._id,
        name: product.name,
        quantity: 1,
        price: product.price || 100
      }],
      deliveryAddress: {
        name: 'Test',
        phone: '9876543210',
        pincode: '110001',
        locality: 'Connaught Place',
        address: 'Shop No 1, Block A',
        city: 'New Delhi',
        state: 'Delhi',
        addressType: 'Home'
      },
      subtotal: product.price || 100,
      shippingFee: 0,
      tax: 0,
      totalAmount: product.price || 100,
      paymentStatus: 'Paid',
      orderStatus: 'Placed',
      paymentMode: 'ICICI',
      gatewayTxnId: 'TXN_DUMMY_12345',
      shipments: []
    });

    await order.save();
    console.log(`Successfully created dummy order with ID: ${order._id}`);

  } catch (error) {
    console.error('Error creating dummy order:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createDummyOrder();
