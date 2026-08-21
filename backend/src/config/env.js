import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try standard backend-level .env first (production standard), fallback to monorepo root for local dev
const localEnvPath = path.resolve(process.cwd(), '.env');
const rootEnvPath = path.join(__dirname, '../../../.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
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

const config = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: validatePort(getEnvVar('PORT', '5000')),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:7051'),
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  
  ICICI: {
    MERCHANT_ID: process.env.ICICI_MERCHANT_ID,
    SECURE_HASH_KEY: process.env.ICICI_SECURE_HASH_KEY,
  },
};

export default config;
