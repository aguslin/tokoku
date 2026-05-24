const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middlewares/auth');
const addressValidator = require('../validators/address.validator');

router.use(authenticate);

router.get('/', addressController.getUserAddresses);
router.post('/', addressValidator.createAddress, addressController.createAddress);
router.put('/:id', addressValidator.updateAddress, addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
