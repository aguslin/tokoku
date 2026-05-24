const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my', authenticate, reviewController.getUserReviews);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
