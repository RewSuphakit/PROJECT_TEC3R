require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1); // Enable trust proxy for rate limiter

const PORT = process.env.PORT || 4001;
const equipmentRoutes = require('./routes/equipmentRoutes');
const userRoutes = require('./routes/userRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const StatsSection = require('./routes/StatsSection');

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:4000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Static files with cache headers (1 day cache for uploaded images)
app.use('/image_return', express.static('image_return', { maxAge: '1d' }));
app.use('/uploads', express.static('uploads', { maxAge: '1d' }));
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', StatsSection);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
