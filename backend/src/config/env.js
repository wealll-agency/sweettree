import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try standard backend-level .env first (production standard), fallback to monorepo root for local dev
const backendEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.join(__dirname, '../../../.env');

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const getEnvVar = (key, defaultValue) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing and no default was provided.`);
  }
  return value;
};

const validatePort = (portStr) => {
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: ${portStr}. Must be a valid port number (1-65535).`);
  }
  return port;
};

const nodeEnv = getEnvVar('NODE_ENV', 'development');

const config = {
  NODE_ENV: nodeEnv,
  PORT: validatePort(getEnvVar('PORT', '5000')),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:7051'),
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  
  ICICI: {
    MERCHANT_ID: process.env.ICICI_MERCHANT_ID,
    AGG_ID: process.env.ICICI_AGG_ID,
    SECURE_HASH_KEY: process.env.ICICI_SECURE_HASH_KEY,
    INITIATE_SALE_URL: process.env.ICICI_INITIATE_SALE_URL,
    STATUS_URL: process.env.ICICI_STATUS_URL,
    REFUND_URL: process.env.ICICI_REFUND_URL,
    RETURN_URL: process.env.ICICI_RETURN_URL,
    CALLBACK_URL: process.env.ICICI_PAYMENT_ADVICE_URL,
  },
};

if (config.NODE_ENV === 'production') {
  const requiredIciciVars = [
    'MERCHANT_ID',
    'AGG_ID',
    'SECURE_HASH_KEY',
    'INITIATE_SALE_URL',
    'RETURN_URL'
  ];
  
  for (const key of requiredIciciVars) {
    if (!config.ICICI[key]) {
      throw new Error(`CRITICAL STARTUP ERROR: Missing required ICICI configuration in production: ICICI_${key}`);
    }
    
    if (typeof config.ICICI[key] === 'string') {
      const val = config.ICICI[key].toLowerCase();
      if (val.includes('uat') || val.includes('test') || val.includes('localhost') || val.includes('127.0.0.1')) {
        throw new Error(`CRITICAL STARTUP ERROR: Invalid production configuration. ICICI_${key} cannot contain 'uat', 'test', or 'localhost'.`);
      }
    }
  }
}

export default config;
