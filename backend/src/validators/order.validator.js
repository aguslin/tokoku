const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');

const createOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required.'),
  body('items.*.productId')
    .isUUID()
    .withMessage('Valid product ID is required for each item.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item.'),
  body('shippingAddressId')
    .isUUID()
    .withMessage('Valid shipping address ID is required.'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required.'),
  validate,
];

const updateOrderStatus = [
  param('id')
    .isUUID()
    .withMessage('Valid order ID is required.'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Order status is required.')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status.'),
  validate,
];

module.exports = {
  createOrder,
  updateOrderStatus,
};
