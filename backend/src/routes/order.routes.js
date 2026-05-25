const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const orderValidator = require('../validators/order.validator');

router.use(authenticate);

router.post('/', orderValidator.createOrder, orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/all', authorize('admin'), orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorize('admin'), orderController.updateStatus);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/confirm-receipt', orderController.confirmReceipt);

module.exports = router;
