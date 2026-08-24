import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';

import config from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

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
import bannerRoutes from './routes/bannerRoutes.js';
import comboRoutes from './routes/comboRoutes.js';
import customSectionRoutes from './routes/customSectionRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static upload files in local frontend/admin images
}));
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:7051',
  'https://sweettreeon.com',
  'https://www.sweettreeon.com'
];
if (config.FRONTEND_URL) {
  allowedOrigins.push(...config.FRONTEND_URL.split(',').map(url => url.trim()));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Folder for Local Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Apply global rate limiting to all API routes
app.use('/api', apiLimiter);

// Sanitize NoSQL injections
app.use(mongoSanitize());

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
app.use('/api/banners', bannerRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/custom-sections', customSectionRoutes);
app.use('/api/blogs', blogRoutes);

// Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Sweettree Enterprise E-commerce API Active' });
});

// Centralized error handler
app.use(errorHandler);

export default app;
