const express = require('express');
const {
  getBloodNetwork,
  getEmergencyOverview,
  getMedicineNetwork,
} = require('../../controllers/emergency/emergencyController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getEmergencyOverview);
router.get('/blood', protect, getBloodNetwork);
router.get('/medicine', protect, getMedicineNetwork);

module.exports = router;
