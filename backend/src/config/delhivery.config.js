import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const delhiveryConfig = {
  baseUrl: process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com',
  apiToken: process.env.DELHIVERY_API_TOKEN
};

export default delhiveryConfig;
