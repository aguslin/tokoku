const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.post('/:orderId/pay', paymentController.createPayment);
router.get('/:orderId', paymentController.getPaymentByOrder);

module.exports = router;
