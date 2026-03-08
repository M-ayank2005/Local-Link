const express = require('express');
const {
  changePassword,
  forgotPassword,
  getAdminDashboard,
  getMyProfile,
  loginUser,
  logoutUser,
  resetPassword,
  registerUser,
  updateMyProfile,
} = require('../controllers/userController');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMyProfile);
router.put('/profile', protect, updateMyProfile);
router.patch('/change-password', protect, changePassword);
router.get('/admin/dashboard', protect, authorizeRoles('admin'), getAdminDashboard);

module.exports = router;
