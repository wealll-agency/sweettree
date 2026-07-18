import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const options = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 15000, // Increased to 15 seconds for live environments
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  };

  // Bind connection events before connecting
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected!');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error in pool:', err.message);
  });

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweettree', options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error during startup: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
