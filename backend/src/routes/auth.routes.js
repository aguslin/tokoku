const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const authValidator = require('../validators/auth.validator');

router.post('/register', authValidator.register, authController.register);
router.post('/login', authValidator.login, authController.login);
router.post('/logout', auth.authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', auth.authenticate, authController.getProfile);

module.exports = router;
