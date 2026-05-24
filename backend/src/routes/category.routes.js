const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const categoryValidator = require('../validators/category.validator');

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);
router.post('/', authenticate, authorize('admin'), categoryValidator.createCategory, categoryController.create);
router.put('/:id', authenticate, authorize('admin'), categoryValidator.updateCategory, categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), categoryController.remove);

module.exports = router;
