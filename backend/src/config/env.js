import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

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

const config = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: validatePort(getEnvVar('PORT', '5000')),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:7051'),
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  
  CCAVENUE: {
    MERCHANT_ID: process.env.CCAVENUE_MERCHANT_ID,
    ACCESS_CODE: process.env.CCAVENUE_ACCESS_CODE,
    WORKING_KEY: process.env.CCAVENUE_WORKING_KEY,
  },
};

export default config;
