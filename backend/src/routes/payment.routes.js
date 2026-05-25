const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

router.use(authenticate);

router.post('/:orderId/pay', paymentController.createPayment);
router.get('/:orderId', paymentController.getPaymentByOrder);
router.post('/:orderId/proof', uploadSingle('file'), paymentController.submitPaymentProof);

module.exports = router;
