import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const options = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 15000, 
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  };

  mongoose.connection.on('disconnected', () => {
    console.error(`\x1b[31m❌ Database:\x1b[0m    Disconnected! PM2/Docker will attempt restart.\x1b[0m`);
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`\x1b[32m✅ Database:\x1b[0m    Reconnected successfully!\x1b[0m`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`\x1b[31m❌ Database:\x1b[0m    Pool connection error: ${err.message}\x1b[0m`);
  });

  let retries = 5;
  let delay = 2000;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      console.log(`\x1b[32m✅ Database:\x1b[0m    Connected to MongoDB cluster \x1b[36m(${conn.connection.host})\x1b[0m`);
      return; // Exit loop on success
    } catch (error) {
      retries -= 1;
      console.error(`\x1b[31m❌ Database:\x1b[0m    Connection failed during startup. Details: ${error.message}`);
      if (retries === 0) {
        console.error(`\n\x1b[31m\x1b[1m❌ FATAL STARTUP ERROR\x1b[0m`);
        console.error(`\x1b[31m====================================================\x1b[0m`);
        console.error(`\x1b[31m❌ Database:\x1b[0m    All connection retries failed`);
        console.error(`\x1b[31m====================================================\x1b[0m\n`);
        setTimeout(() => {
          process.exit(1);
        }, 1000);
      } else {
        console.log(`\x1b[33m⏳ Database:\x1b[0m    Retrying in ${delay/1000} seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
};

export default connectDB;
