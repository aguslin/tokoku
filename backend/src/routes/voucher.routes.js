const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/validate', authenticate, voucherController.validateVoucher);
router.get('/', authenticate, authorize('admin'), voucherController.getAll);
router.post('/', authenticate, authorize('admin'), voucherController.create);
router.put('/:id', authenticate, authorize('admin'), voucherController.update);
router.delete('/:id', authenticate, authorize('admin'), voucherController.remove);

module.exports = router;
