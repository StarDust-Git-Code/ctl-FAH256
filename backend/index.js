import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup to allow request from Vercel frontend or local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Allow any Vercel preview deployment URL
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow all origins for API public access
  },
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Root & Health Check Route for Render
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'FAH256 Cold Chain Telematics Express REST API',
    platform: 'Render Server',
    endpoints: '/api/*'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FAH256 Telematics API Server Online', port: PORT });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 FAH256 REST API Server running on Render Port ${PORT}`);
});
