const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
  createBooking,
  returnBooking,
  cancelBooking,
  getMyBookings,
} = require('../../controllers/resources/bookingController');

router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createBooking);
router.put('/:id/return', protect, returnBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
