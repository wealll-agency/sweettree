import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';

// Config imports
import config from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import { initCronJobs, stopCronJobs } from './utils/cronJobs.js';

// Validate critical payment environment variables
if (config.NODE_ENV === 'production') {
  const missingKeys = Object.entries(config.ICICI)
    .filter(([_, value]) => !value)
    .map(([key]) => `ICICI_${key}`);

  const requiredCoreKeys = ['JWT_SECRET', 'MONGODB_URI', 'FRONTEND_URL'];
  for (const key of requiredCoreKeys) {
    if (!process.env[key]) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error(`\n\x1b[31m\x1b[1m❌ FATAL STARTUP ERROR\x1b[0m`);
    console.error(`\x1b[31m====================================================\x1b[0m`);
    console.error(`\x1b[31m❌ Missing Keys:\x1b[0m Required variables missing in production: ${missingKeys.join(', ')}`);
    console.error(`\x1b[31m❌ Action:\x1b[0m       Shutting down server to prevent silent checkout/auth failures.`);
    console.error(`\x1b[31m====================================================\x1b[0m\n`);
    process.exit(1);
  }
}

let server;

// Start Server Lifecycle
const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();

    // 2. Start HTTP(S) Server
    const PORT = config.PORT;

    if (config.SSL_KEY_PATH && config.SSL_CERT_PATH) {
      try {
        const options = {
          key: fs.readFileSync(config.SSL_KEY_PATH),
          cert: fs.readFileSync(config.SSL_CERT_PATH)
        };
        server = https.createServer(options, app).listen(PORT, onListening);
      } catch (error) {
        console.error(`Failed to start HTTPS server: ${error.message}`);
        console.log("Falling back to HTTP server...");
        server = app.listen(PORT, onListening);
      }
    } else {
      server = app.listen(PORT, onListening);
    }

    // Attach error handler to handle EADDRINUSE explicitly
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;

      if (error.code === 'EADDRINUSE') {
        console.error(`\n\x1b[31m\x1b[1m❌ FATAL STARTUP ERROR\x1b[0m`);
        console.error(`\x1b[31m====================================================\x1b[0m`);
        console.error(`\x1b[31m❌ Port Conflict:\x1b[0m Port ${PORT} is already in use.`);
        console.error(`\x1b[31m❌ Action:\x1b[0m        Another process is likely running. Shutting down safely.`);
        console.error(`\x1b[31m====================================================\x1b[0m\n`);
        process.exit(1);
      } else {
        throw error;
      }
    });

  } catch (error) {
    console.error(`[CRITICAL] Server failed to start: ${error.message}`, error);
    process.exit(1);
  }
};

const onListening = () => {
  console.log(`\n\x1b[36m\x1b[1m🚀 SweetTree Enterprise API\x1b[0m`);
  console.log(`\x1b[36m====================================================\x1b[0m`);
  console.log(`\x1b[32m✅ HTTP Server:\x1b[0m  Running in \x1b[33m${config.NODE_ENV}\x1b[0m mode on port \x1b[33m${config.PORT}\x1b[0m`);
  
  // 3. Initialize Cron Jobs only after successful port binding
  initCronJobs();
};

// Graceful Shutdown Handler
let isShuttingDown = false;
const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  
  // Stop background jobs
  stopCronJobs();

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP/HTTPS server closed.');
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close(false);
          console.log('[Database] MongoDB connection closed.');
        }
        process.exit(0);
      } catch (err) {
        console.error('[Database] Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
    
    // Force shutdown if connections do not close in time (10s)
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Listen for termination signals (Docker, PM2, Ctrl+C)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.message}`, err);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error(`[CRITICAL] Uncaught Exception: ${err.message}`, err);
  // Trigger graceful shutdown on fatal errors to allow in-flight requests to complete
  gracefulShutdown('uncaughtException');
});

// Start the server
startServer();
