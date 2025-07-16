const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const companyRoutes = require('./routes/company');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Visitify API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/superadmin', require('./routes/superadmin'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/receptionist', require('./routes/receptionist'));
app.use('/api/v1/employee', require('./routes/employee'));
app.use('/api/v1/visitor', require('./routes/visitor'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/billing', require('./routes/billing'));
app.use('/api/v1/company', companyRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Visitify Backend Server is running!
📍 Environment: ${process.env.NODE_ENV}
🌐 Server: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api/v1
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;