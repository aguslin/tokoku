const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');

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
  createAddress,
  updateAddress,
};
