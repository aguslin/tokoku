const { body, query } = require('express-validator');
const { validate } = require('../middlewares/validate');

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

module.exports = {
  createProduct,
  updateProduct,
  productQuery,
};
