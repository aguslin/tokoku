const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.get('/', authorize('admin'), userController.getAllUsers);
router.put('/:id/role', authorize('admin'), userController.updateUserRole);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
