const axios = require('axios');
const Resource = require('../../models/resources/Resource');
const ResourceBooking = require('../../models/resources/Booking');
const DepositLedger = require('../../models/resources/DepositLedger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: number of days between two dates (inclusive start, exclusive end)
const daysBetween = (from, to) => {
  const diff = new Date(to) - new Date(from);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Helper: check if a date range overlaps any existing confirmed/active booking
const hasDateConflict = async (resourceId, fromDate, toDate, excludeBookingId = null) => {
  const query = {
    resource: resourceId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { fromDate: { $lt: new Date(toDate) }, toDate: { $gt: new Date(fromDate) } },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const count = await ResourceBooking.countDocuments(query);
  return count > 0;
};

// @desc    Book a resource (creates booking + holds deposit)
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const { resourceId, fromDate, toDate, paymentMethod = 'cash' } = req.body;

    if (!resourceId || !fromDate || !toDate) {
      return res.status(400).json({ success: false, error: 'resourceId, fromDate and toDate are required' });
    }

    const resource = await Resource.findById(resourceId).populate('owner', '_id');
    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    if (resource.owner._id.toString() === userId.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot book your own resource' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) {
      return res.status(400).json({ success: false, error: 'toDate must be after fromDate' });
    }
    if (from < new Date(resource.availableFrom) || to > new Date(resource.availableTo)) {
      return res.status(400).json({ success: false, error: 'Dates are outside owner availability window' });
    }

    const conflict = await hasDateConflict(resourceId, fromDate, toDate);
    if (conflict) {
      return res.status(400).json({ success: false, error: 'Resource not available for selected dates' });
    }

    const days = daysBetween(from, to);
    const totalRent = days * resource.pricePerDay;

    // Best-effort ML no-show probability check
    let mlNoShowProbability = null;
    let mlRiskLevel = null;
    let requiresExtraConfirmation = false;

    try {
      const userBookingHistory = await ResourceBooking.find({ renter: userId });
      const totalBookings = userBookingHistory.length;
      const cancellations = userBookingHistory.filter((b) => b.status === 'cancelled').length;
      const noShows = userBookingHistory.filter(
        (b) => b.status === 'confirmed' && b.depositStatus === 'forfeited'
      ).length;

      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/ml/no-show-prob`,
        {
          booking_id: 'pre-create',
          user_history: {
            total_bookings: totalBookings,
            cancellations,
            no_shows: noShows,
            is_verified: req.user.isVerified,
          },
        },
        { timeout: 400 }
      );
      mlNoShowProbability = mlRes.data.probability;
      mlRiskLevel = mlRes.data.risk_level;
      requiresExtraConfirmation = mlRiskLevel === 'high';
    } catch (_mlErr) {
      // ML unavailable — proceed without risk check
    }

    // If high risk and no explicit user confirmation, ask frontend to re-submit with confirmation flag
    if (requiresExtraConfirmation && !req.body.confirmedHighRisk) {
      return res.status(202).json({
        success: false,
        requires_extra_confirmation: true,
        ml_risk_level: mlRiskLevel,
        ml_no_show_probability: mlNoShowProbability,
        message: 'High no-show risk detected. Re-submit with confirmedHighRisk: true to proceed.',
      });
    }

    // Create booking
    const booking = await ResourceBooking.create({
      resource: resourceId,
      renter: userId,
      fromDate: from,
      toDate: to,
      totalRent,
      depositAmount: resource.depositAmount,
      depositStatus: 'held',
      status: 'confirmed',
      paymentMethod,
      mlNoShowProbability,
      mlRiskLevel,
    });

    // Write deposit ledger — "held" event
    const ledger = await DepositLedger.create({
      booking: booking._id,
      renter: userId,
      owner: resource.owner._id,
      amount: resource.depositAmount,
      refundAmount: 0,
      event: 'held',
      notes: `Booking created for ${days} day(s)`,
    });

    booking.depositLedger = ledger._id;
    await booking.save();

    res.status(201).json({
      success: true,
      data: {
        ...booking.toObject(),
        ml_no_show_probability: mlNoShowProbability,
        ml_risk_level: mlRiskLevel,
        depositLedgerId: ledger._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Owner confirms item returned — release or forfeit deposit
// @route   PUT /api/v1/bookings/:id/return
// @access  Private (resource owner only)
exports.returnBooking = async (req, res) => {
  try {
    const userId = req.user ? req.user._id.toString() : null;
    const { condition, notes = '' } = req.body;

    if (!condition || !['good', 'damaged'].includes(condition)) {
      return res.status(400).json({ success: false, error: 'condition must be good or damaged' });
    }

    const booking = await ResourceBooking.findById(req.params.id).populate('resource');
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Only the resource owner can confirm return
    if (booking.resource.owner.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Only the owner can confirm return' });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Booking is not in a returnable state' });
    }

    const depositStatus = condition === 'good' ? 'released' : 'forfeited';
    const refundAmount = condition === 'good' ? booking.depositAmount : 0;
    const ledgerEvent = condition === 'good' ? 'released' : 'forfeited';

    booking.status = 'returned';
    booking.depositStatus = depositStatus;
    booking.returnCondition = condition;
    booking.returnNotes = notes;
    await booking.save();

    await DepositLedger.create({
      booking: booking._id,
      renter: booking.renter,
      owner: userId,
      amount: booking.depositAmount,
      refundAmount,
      event: ledgerEvent,
      notes,
    });

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        depositStatus,
        refundAmount,
        message:
          condition === 'good'
            ? `Deposit of ₹${booking.depositAmount} will be refunded to renter.`
            : 'Deposit forfeited due to damage.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Renter cancels booking — refund rules: >48h = full, <48h = 50%, active = 0%
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private (renter only)
exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.user ? req.user._id.toString() : null;
    const booking = await ResourceBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    if (booking.renter.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Not your booking' });
    }
    if (!['confirmed', 'pending'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'Booking cannot be cancelled at this stage' });
    }

    const hoursUntilStart = (new Date(booking.fromDate) - new Date()) / (1000 * 60 * 60);

    let refundAmount = 0;
    let depositStatus = 'forfeited';
    let ledgerEvent = 'forfeited';

    if (hoursUntilStart > 48) {
      refundAmount = booking.depositAmount;
      depositStatus = 'released';
      ledgerEvent = 'released';
    } else if (hoursUntilStart > 0) {
      refundAmount = Math.floor(booking.depositAmount * 0.5);
      depositStatus = 'partial_refund';
      ledgerEvent = 'partial_refund';
    }

    booking.status = 'cancelled';
    booking.depositStatus = depositStatus;
    await booking.save();

    await DepositLedger.create({
      booking: booking._id,
      renter: userId,
      owner: booking.resource,
      amount: booking.depositAmount,
      refundAmount,
      event: ledgerEvent,
      notes: `Cancelled ${hoursUntilStart.toFixed(0)}h before start`,
    });

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        refundAmount,
        depositStatus,
        message: `Cancellation confirmed. Refund: ₹${refundAmount}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all bookings made by logged-in renter
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const bookings = await ResourceBooking.find({ renter: userId })
      .populate('resource', 'title category pricePerDay depositAmount images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
