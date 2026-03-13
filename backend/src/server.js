const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Trust proxy for secure cookies behind Vercel
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// Robust CORS for Vercel deployments
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://local-link-frontend.vercel.app', // Adding fallback just in case
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(o => o === origin || (origin.endsWith('.vercel.app') && origin.includes('local-link')));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS Blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Debug middleware to log headers in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

const foodRoutes = require('./routes/food/foodRoutes');
const skillsRoutes = require('./routes/skills/skillsRoutes');
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/v1/commerce', require('./routes/commerce/commerceRoutes'));
app.use('/api/v1/shopkeeper', require('./routes/commerce/shopkeeperRoutes'));
app.use('/api/v1/admin', require('./routes/commerce/adminRoutes'));
app.use('/api/v1/emergency', require('./routes/emergency/emergencyRoutes'));
app.use('/api/food', foodRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/resources', require('./routes/resources/resourceRoutes'));
app.use('/api/v1/bookings', require('./routes/resources/bookingRoutes'));

app.get('/', (req, res) => {
  res.send('Local Links Backend is alive and ready!');
});

const PORT = process.env.PORT || 5000;

console.log('Production Check:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  FRONTEND_URL: process.env.FRONTEND_URL
});

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
