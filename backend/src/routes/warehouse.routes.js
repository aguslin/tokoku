const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', warehouseController.getAll);
router.get('/:id', warehouseController.getById);
router.get('/:id/inventory', authenticate, authorize('admin'), warehouseController.getInventory);
router.post('/', authenticate, authorize('admin'), warehouseController.create);
router.put('/:id', authenticate, authorize('admin'), warehouseController.update);
router.delete('/:id', authenticate, authorize('admin'), warehouseController.remove);

module.exports = router;
