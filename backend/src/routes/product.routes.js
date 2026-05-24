const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const productValidator = require('../validators/product.validator');

router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/:slug', productController.getBySlug);
router.post('/', authenticate, authorize('admin', 'seller'), productValidator.createProduct, productController.create);
router.put('/:id', authenticate, authorize('admin', 'seller'), productValidator.updateProduct, productController.update);
router.delete('/:id', authenticate, authorize('admin', 'seller'), productController.remove);

module.exports = router;
