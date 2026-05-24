const express = require('express');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/addresses', require('./address.routes'));
router.use('/vouchers', require('./voucher.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/upload', require('./upload.routes'));

module.exports = router;
