import 'dotenv/config';
import app from './src/app.js';
import logger from './src/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CLIENT_ID',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error(`\nL Missing required environment variables:`);
  console.error(`   ${missingEnvVars.join(', ')}`);
  console.error(`\nPlease check your .env file and ensure all required variables are set.\n`);
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`\n 4Csecure Backend Server Running`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`\n=� API Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/auth/google - Google OAuth login`);
  console.log(`   GET  /api/documents - Get all documents`);
  console.log(`   POST /api/payments/create-checkout - Create checkout session`);
  console.log(`\n= Access the API at: http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
