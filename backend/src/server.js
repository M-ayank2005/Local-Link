const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

const foodRoutes = require('./routes/food/foodRoutes');
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/v1/commerce', require('./routes/commerce/commerceRoutes'));
app.use('/api/v1/shopkeeper', require('./routes/commerce/shopkeeperRoutes'));
app.use('/api/v1/admin', require('./routes/commerce/adminRoutes'));
app.use('/api/v1/emergency', require('./routes/emergency/emergencyRoutes'));
app.use('/api/food', foodRoutes);

// Existing root route
app.get('/health', (req, res) => {
  res.send('Local Links API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
