const express = require('express');
const {
  getAdminDashboard,
  getMyProfile,
  loginUser,
  registerUser,
} = require('../controllers/userController');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMyProfile);
router.get('/admin/dashboard', protect, authorizeRoles('admin'), getAdminDashboard);

module.exports = router;
