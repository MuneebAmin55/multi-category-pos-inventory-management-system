/**
 * @file app.js
 * @description Express application setup. Configures global middlewares, API route registration, and centralized error handling.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows static image uploads to be fetched by frontend
  })
);

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matching origin
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request payload parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded static assets (product images)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Main API Route Registration
app.use('/api', apiRoutes);

// Root Ping Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Multi-Category POS & Inventory Management System API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
  });
});

// 404 Handler for undefined routes
app.use('*', (req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.originalUrl} not found on this server`));
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
