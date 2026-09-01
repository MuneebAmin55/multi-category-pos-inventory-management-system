/**
 * @file routes/index.js
 * @description Central API router aggregating and mounting all feature routers.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const posRoutes = require('./pos.routes');
const transactionRoutes = require('./transaction.routes');
const statsRoutes = require('./stats.routes');

// API status/health endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Feature routers registration
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/pos', posRoutes);
router.use('/transactions', transactionRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
