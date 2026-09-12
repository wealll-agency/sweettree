import mongoose from 'mongoose';
import config from '../backend/src/config/env.js';
import User from '../backend/src/models/User.js';
import Product from '../backend/src/models/Product.js';
import Warehouse from '../backend/src/models/Warehouse.js';
import Inventory from '../backend/src/models/Inventory.js';
import { createProduct } from '../backend/src/controllers/productController.js';

async function testProductCreation() {
  await mongoose.connect(config.MONGODB_URI);
  console.log('DB connected');

  const admin = await User.findOne({ email: 'sweettree2026@gmail.com' });
  if (!admin) {
    console.error('Admin not found');
    process.exit(1);
  }

  // Mock req and res
  const req = {
    user: admin,
    body: {
      name: 'Test Product With New Category',
      category: 'nuts',
      subCategory: '',
      brand: 'Sweettree',
      productType: 'Physical',
      price: '2000',
      purchasePrice: '0',
      minOrderQty: '1',
      discount: '0',
      discountType: 'Flat',
      taxAmount: '0',
      taxCalculation: 'Include with product',
      shippingCost: '0',
      shippingMultiplyWithQty: 'false',
      description: 'Test description',
      ingredients: '',
      benefits: '',
      batchNumber: 'B123',
      expiryDate: '2027-01-01',
      stock: '20',
      packSizes: '[]'
    },
    files: null
  };

  const res = {
    status: function(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json: function(data) {
      console.log('RESPONSE STATUS:', this.statusCode || 200);
      console.log('RESPONSE DATA:', data);
    }
  };

  const next = function(err) {
    console.error('CRITICAL SERVER ERROR STACK TRACE:');
    console.error(err);
  };

  console.log('Calling createProduct...');
  await createProduct(req, res, next);
  process.exit(0);
}

testProductCreation().catch(err => {
  console.error('OUTER ERROR:', err);
  process.exit(1);
});
