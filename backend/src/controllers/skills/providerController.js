const Service = require('../../models/skills/Service');
const Booking = require('../../models/skills/Booking');
const Review = require('../../models/skills/Review');

// @desc    Create a new service
// @route   POST /api/v1/skills/provider/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      pricePerHour,
      pricePerVisit,
      location,
      address,
      serviceRadius,
      availability,
      skills,
      experience,
      languages,
    } = req.body;

    const service = await Service.create({
      provider: req.user._id,
      title,
      category,
      description,
      pricePerHour,
      pricePerVisit,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      address,
      serviceRadius: serviceRadius || 5,
      availability,
      skills: skills || [],
      experience: experience || 0,
      languages: languages || ['Hindi'],
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating service',
      error: error.message,
    });
  }
};

// @desc    Update a service
// @route   PUT /api/v1/skills/provider/services/:id
// @access  Private (Provider only)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service',
      });
    }

    // Update location format if provided
    if (req.body.location?.coordinates) {
      req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates,
      };
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating service',
      error: error.message,
    });
  }
};

// @desc    Delete a service
// @route   DELETE /api/v1/skills/provider/services/:id
// @access  Private (Provider only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service',
      });
    }

    // Soft delete - just mark as inactive
    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting service',
      error: error.message,
    });
  }
};

// @desc    Get provider's services
// @route   GET /api/v1/skills/provider/services
// @access  Private (Provider only)
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services',
      error: error.message,
    });
  }
};

// @desc    Get provider's bookings
// @route   GET /api/v1/skills/provider/bookings
// @access  Private (Provider only)
exports.getProviderBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { provider: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('service', 'title category pricePerHour')
      .populate('customer', 'fullName phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    // Get stats
    const stats = await Booking.aggregate([
      { $match: { provider: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      stats,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/skills/provider/bookings/:id/status
// @access  Private (Provider only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if provider owns this booking
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['confirmed', 'rejected'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;

    if (status === 'cancelled' || status === 'rejected') {
      booking.cancellationReason = cancellationReason || 'Cancelled by provider';
      booking.cancelledBy = 'provider';
    }

    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category')
      .populate('customer', 'fullName phone');

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking',
      error: error.message,
    });
  }
};

// @desc    Get provider dashboard stats
// @route   GET /api/v1/skills/provider/dashboard
// @access  Private (Provider only)
exports.getDashboardStats = async (req, res) => {
  try {
    const providerId = req.user._id;

    // Get services count
    const servicesCount = await Service.countDocuments({
      provider: providerId,
      isActive: true,
    });

    // Get bookings stats
    const bookingStats = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({ provider: providerId })
      .populate('service', 'title category')
      .populate('customer', 'fullName phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get reviews stats
    const reviewStats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        servicesCount,
        bookingStats: bookingStats[0] || {
          totalBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          totalRevenue: 0,
        },
        reviewStats: reviewStats[0] || { totalReviews: 0, avgRating: 0 },
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard',
      error: error.message,
    });
  }
};

// @desc    Toggle service availability
// @route   PUT /api/v1/skills/provider/services/:id/toggle
// @access  Private (Provider only)
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      data: service,
    });
  } catch (error) {
    console.error('Error toggling service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update availability schedule
// @route   PUT /api/v1/skills/provider/services/:id/availability
// @access  Private (Provider only)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    service.availability = availability;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: service,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Respond to a review
// @route   PUT /api/v1/skills/provider/reviews/:id/respond
// @access  Private (Provider only)
exports.respondToReview = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review',
      });
    }

    review.response = {
      text,
      respondedAt: new Date(),
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
