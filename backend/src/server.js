import express from 'express'; // Trigger restart
import 'express-async-errors'; // Catch async route errors
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';

// Config imports
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import delhiveryRoutes from './routes/delhivery.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Connect to MongoDB
connectDB();

// Validate critical payment environment variables
if (process.env.NODE_ENV === 'production') {
  const requiredKeys = ['CCAVENUE_MERCHANT_ID', 'CCAVENUE_WORKING_KEY', 'CCAVENUE_ACCESS_CODE'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    console.error(`\n[CRITICAL WARNING] Missing CCAvenue Payment Keys in production: ${missingKeys.join(', ')}`);
    console.error('CCAvenue payments will fail until these are provided in your environment variables.\n');
  }
}

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static upload files in local frontend/admin images
}));
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:7051',
  'https://sweettreeon.com',
  'https://www.sweettreeon.com'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Folder for Local Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Prevent caching for API routes (fixes live server stale data issues)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delhivery', delhiveryRoutes);
app.use('/api/warehouses', warehouseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Sweettree Enterprise E-commerce API Active' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    server = https.createServer(options, app).listen(PORT, () => {
      console.log(`HTTPS Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start HTTPS server: ${error.message}`);
    console.log("Falling back to HTTP server...");
    server = app.listen(PORT, () => {
      console.log(`HTTP Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }
} else {
  server = app.listen(PORT, () => {
    console.log(`HTTP Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}


// Graceful Shutdown Handler
const gracefulShutdown = () => {
  console.log('Initiating graceful shutdown...');
  server.close(async () => {
    console.log('HTTP/HTTPS server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown if it takes too long (10s)
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals (e.g., from Docker, PM2, or Ctrl+C)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.message}`, err);
  // Do not gracefully shut down server to prevent 502 loop in production.
  // Instead, PM2 or process manager should handle serious crashes, 
  // and express-async-errors will handle route-level promise rejections.
});

process.on('uncaughtException', (err) => {
  console.error(`[CRITICAL] Uncaught Exception: ${err.message}`, err);
  // Log safely, but avoid immediate exit for minor exceptions, letting process manager decide.
});

// Trigger reload for nodemon configuration updates.

// Reload trigger 2

// Reload trigger 3

// Reload trigger 4

// Reload trigger 5
