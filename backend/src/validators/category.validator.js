const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');

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

module.exports = {
  createCategory,
  updateCategory,
};
