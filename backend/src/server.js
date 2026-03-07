const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/v1/commerce', require('./routes/commerce/commerceRoutes'));
app.use('/api/v1/shopkeeper', require('./routes/commerce/shopkeeperRoutes'));
app.use('/api/v1/admin', require('./routes/commerce/adminRoutes'));

// Existing root route
app.get('/health', (req, res) => {
  res.send('Local Links API is running...');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
