const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paystackWebhook = require('./routes/paystackWebhook'); // ✅ webhook route
const paymentProofRoutes = require('./routes/paymentProofRoutes');

dotenv.config();

const app = express();

// Middleware to handle raw body for webhook
app.use('/api/paystack/webhook', express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// General Middlewares
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // Body parser
app.use('/uploads/proofs', express.static(path.join(__dirname, '/uploads/proofs'))); // Serve proof uploads
app.use(cors({
  origin: 'http://localhost:3000', // ✅ Change this in production
  credentials: true,
}));
app.use(helmet());
app.use(compression());

// Root test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/paystack/webhook', paystackWebhook); // ✅ Webhook route registered
app.use('/api/payment-proofs', paymentProofRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// MongoDB connection & server startup
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
