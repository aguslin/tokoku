const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');

// Public — used by the checkout flow to show Reguler/Instan options and the
// nearest origin warehouse.
router.post('/quote', shippingController.quote);
router.get('/couriers', shippingController.couriers);

module.exports = router;
