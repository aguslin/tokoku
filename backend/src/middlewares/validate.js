const { validationResult, body, query, param } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    const apiError = ApiError.unprocessable('Validation failed');
    apiError.errors = extractedErrors;
    throw apiError;
  }
  next();
};

const register = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters.'),
  validate,
];

const login = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  validate,
];

const forgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  validate,
];

const resetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  validate,
];

const createProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required.')
    .isLength({ max: 200 })
    .withMessage('Product name must not exceed 200 characters.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.'),
  body('categoryId')
    .isUUID()
    .withMessage('Valid category ID is required.'),
  validate,
];

const updateProduct = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty.')
    .isLength({ max: 200 })
    .withMessage('Product name must not exceed 200 characters.'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty.'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Valid category ID is required.'),
  validate,
];

const productQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number.'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number.'),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Valid category ID is required.'),
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search term must be a string.'),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field.'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc.'),
  validate,
];

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

const createCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters.'),
  body('parentId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Valid parent category ID is required.'),
  validate,
];

const updateCategory = [
  param('id')
    .isUUID()
    .withMessage('Valid category ID is required.'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters.'),
  body('parentId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Valid parent category ID is required.'),
  validate,
];

const createAddress = [
  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Label must not exceed 50 characters.'),
  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required.')
    .isLength({ max: 100 })
    .withMessage('Recipient name must not exceed 100 characters.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^\+?[\d\s\-()]{7,20}$/)
    .withMessage('Please provide a valid phone number.'),
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required.')
    .isLength({ max: 200 })
    .withMessage('Address line 1 must not exceed 200 characters.'),
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must not exceed 200 characters.'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required.')
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters.'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required.')
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters.'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required.')
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters.'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required.')
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters.'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean.'),
  validate,
];

const updateAddress = [
  param('id')
    .isUUID()
    .withMessage('Valid address ID is required.'),
  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Label must not exceed 50 characters.'),
  body('recipientName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Recipient name cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Recipient name must not exceed 100 characters.'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty.')
    .matches(/^\+?[\d\s\-()]{7,20}$/)
    .withMessage('Please provide a valid phone number.'),
  body('addressLine1')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address line 1 cannot be empty.')
    .isLength({ max: 200 })
    .withMessage('Address line 1 must not exceed 200 characters.'),
  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must not exceed 200 characters.'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters.'),
  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters.'),
  body('postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal code cannot be empty.')
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters.'),
  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters.'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean.'),
  validate,
];

module.exports = {
  validate,
  register,
  login,
  forgotPassword,
  resetPassword,
  createProduct,
  updateProduct,
  productQuery,
  createOrder,
  updateOrderStatus,
  createCategory,
  updateCategory,
  createAddress,
  updateAddress,
};
