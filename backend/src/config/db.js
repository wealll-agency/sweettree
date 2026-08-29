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

  let delay = 2000;

  while (true) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      console.log(`\x1b[32m✅ Database:\x1b[0m    Connected to MongoDB cluster \x1b[36m(${conn.connection.host})\x1b[0m`);
      return; // Exit loop on success
    } catch (error) {
      // Differentiate permanent vs recoverable error
      const isAuthError = error.name === 'MongoServerError' && (error.code === 8000 || error.code === 18);
      const isConfigError = error.name === 'MongoParseError' || error.name === 'MongoAPIError' || isAuthError;

      if (isConfigError) {
        console.error(`\n\x1b[31m\x1b[1m❌ FATAL STARTUP ERROR: CONFIGURATION\x1b[0m`);
        console.error(`\x1b[31m====================================================\x1b[0m`);
        console.error(`\x1b[31m❌ Database:\x1b[0m    Permanent configuration error: ${error.message}`);
        console.error(`\x1b[31m====================================================\x1b[0m\n`);
        process.exit(1);
      }

      console.error(`\x1b[31m❌ Database:\x1b[0m    Connection failed during startup. Details: ${error.message}`);
      
      console.log(`\x1b[33m⏳ Database:\x1b[0m    Retrying in ${delay/1000} seconds... (Infinite retry for recoverable errors)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 60000); // Exponential backoff capped at 60s
    }
  }
};

export default connectDB;
