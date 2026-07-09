import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Log from '../models/Log.js';

dotenv.config({ path: '../.env' }); // Load from monorepo root or sibling

// Herbal products data
const productsData = [
  {
    name: "Sweettree Anmol Premium Medjool Dates 500gm (Khajur/Khajoor)",
    brand: "Sweettree ANMOL",
    category: "Top Selling Products",
    price: 789,
    discount: 50,
    mrp: 1578,
    perGram: "₹158 / 100g",
    rating: 4.9,
    description: "Premium quality natural Medjool dates directly sourced for the best health benefits.",
    ingredients: ["100% Medjool Dates"],
    benefits: ["Rich in antioxidants", "Natural sweetener", "High in fiber"],
    images: ["/top_product1.png"],
    batchNumber: "MCL-2026-B1",
    expiryDate: new Date('2028-06-20'),
    stock: 150
  },
  {
    name: "Sweettree Anmol Premium Walnut Kernel (Jumbo Size - Rare Crop)",
    brand: "Sweettree ANMOL",
    category: "Top Selling Products",
    price: 975,
    discount: 34,
    mrp: 1499,
    perGram: "₹195 / 100g",
    rating: 4.8,
    description: "Jumbo sized rare walnut kernels.",
    ingredients: ["100% Walnut Kernels"],
    benefits: ["Brain food", "Rich in Omega 3"],
    images: ["/top_product2.png"],
    batchNumber: "MCL-2026-B1",
    expiryDate: new Date('2028-06-20'),
    stock: 200
  },
  {
    name: "Sweettree For Good Nutty Date Bites 180g",
    brand: "Sweettree",
    category: "Healthy Snacking",
    price: 445,
    discount: 36,
    mrp: 699,
    perGram: "₹124 / 100g",
    rating: 5.0,
    description: "Healthy nut bites perfect for evening snacks.",
    ingredients: ["Dates", "Cashews", "Almonds"],
    benefits: ["Energy booster", "No added sugar"],
    images: ["/new_product1.png"],
    batchNumber: "MCL-2026-B1",
    expiryDate: new Date('2028-06-20'),
    stock: 120
  },
  {
    name: "Sweettree Snackrite Roasted Makhana Pudina Chatka 70g",
    brand: "Sweettree SNACKRITE",
    category: "Healthy Snacking",
    price: 255,
    discount: 54,
    mrp: 556,
    perGram: "₹182 / 100g",
    rating: 4.5,
    description: "Mint flavored roasted foxnuts.",
    ingredients: ["Makhana", "Pudina Flavor", "Salt"],
    benefits: ["Low calories", "High protein"],
    images: ["/new_product3.png"],
    batchNumber: "MCL-2026-B1",
    expiryDate: new Date('2028-06-20'),
    stock: 80
  },
  {
    name: "Sweettree Whole Spices 400g Combo Pack",
    brand: "Sweettree",
    category: "Whole Spices",
    price: 240,
    discount: 0,
    mrp: 240,
    perGram: "₹60 / 100g",
    rating: 4.2,
    description: "Combo pack of premium whole spices.",
    ingredients: ["Coriander Seeds", "Cumin Seeds"],
    benefits: ["Aromatic", "Freshly sourced"],
    images: ["/new_product3.png"],
    batchNumber: "MCL-2026-B1",
    expiryDate: new Date('2028-06-20'),
    stock: 90
  }
];

const seedData = async () => {
  try {
    // Determine MONGODB_URI local fallback if not defined in process.env
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweettree';
    console.log(`Seeding database at: ${uri}`);
    
    await mongoose.connect(uri);

    // Clear all existing entries
    await User.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Log.deleteMany();

    console.log('Database wiped.');

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Sweettree Admin',
        email: 'sweettree2026@gmail.com',
        password: 'SweetTree@2026', // gets hashed automatically in pre-save
        phone: '9999999999',
        role: 'Super Admin'
      },
      {
        name: 'Product Manager',
        email: 'manager@sweettree.com',
        password: 'manager123',
        phone: '8888888888',
        role: 'Manager'
      },
      {
        name: 'Staff Member',
        email: 'staff@sweettree.com',
        password: 'staff123',
        phone: '7777777777',
        role: 'Staff'
      },
      {
        name: 'Rahul Sharma',
        email: 'customer@sweettree.com',
        password: 'customer123',
        phone: '9876543210',
        role: 'Customer',
        addresses: [
          {
            street: '121, Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            zipCode: '700016',
            country: 'India',
            isDefault: true
          }
        ]
      }
    ]);

    console.log('Default users seeded.');

    const adminUser = users[0];

    // 2. Seed Products
    const seededProducts = await Product.create(productsData);
    console.log('Herbal products seeded.');

    // 3. Seed Inventory batches
    for (const prod of seededProducts) {
      await Inventory.create({
        product: prod._id,
        batchNumber: prod.batchNumber,
        expiryDate: prod.expiryDate,
        stockQuantity: prod.stock,
        lowStockThreshold: 10,
        adjustments: [
          {
            quantityChanged: prod.stock,
            type: 'Restock',
            reason: 'Database Seed Load',
            adjustedBy: adminUser._id
          }
        ]
      });
    }
    console.log('Inventory batches seeded.');

    // 4. Seed Coupons
    await Coupon.create([
      {
        code: 'WELCOME20',
        discountPercentage: 20,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        usageCount: 0,
        isActive: true
      },
      {
        code: 'FESTIVE10',
        discountPercentage: 10,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 200,
        usageCount: 0,
        isActive: true
      }
    ]);
    console.log('Discount coupons seeded.');

    // 5. Seed an order history for the admin dashboard demo
    const customerUser = users[3];
    const orderItems = [
      {
        product: seededProducts[0]._id,
        name: seededProducts[0].name,
        quantity: 1,
        price: 299
      },
      {
        product: seededProducts[1]._id,
        name: seededProducts[1].name,
        quantity: 2,
        price: 199
      }
    ];

    const order = await Order.create({
      user: customerUser._id,
      items: orderItems,
      deliveryAddress: customerUser.addresses[0],
      couponCode: 'WELCOME20',
      couponDiscount: 75,
      subtotal: 697,
      shippingFee: 40,
      tax: 50,
      totalAmount: 712,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      razorpayOrderId: 'order_mock12345678',
      razorpayPaymentId: 'pay_mock12345678',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await Payment.create({
      order: order._id,
      razorpayOrderId: 'order_mock12345678',
      razorpayPaymentId: 'pay_mock12345678',
      razorpaySignature: 'sig_mock12345678',
      amount: 712,
      status: 'Captured'
    });

    console.log('Order and Payment history seeds completed.');

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
