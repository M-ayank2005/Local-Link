const Service = require('../../models/skills/Service');
const SkillBooking = require('../../models/skills/Booking');
const Review = require('../../models/skills/Review');

// @desc    Get all services with filters
// @route   GET /api/v1/skills/services
// @access  Public
exports.getAllServices = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy,
      order = 'desc',
      page = 1,
      limit = 12,
      lat,
      lng,
      radius = 10,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { pricePerHour: 1 };
        break;
      case 'price_high':
        sortOptions = { pricePerHour: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'reviews':
        sortOptions = { totalReviews: -1 };
        break;
      case 'experience':
        sortOptions = { experience: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let services;
    let total;

    // Geospatial query if coordinates provided
    if (lat && lng) {
      services = await Service.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)],
            },
            distanceField: 'distance',
            maxDistance: Number(radius) * 1000, // Convert km to meters
            spherical: true,
            query: query,
          },
        },
        { $sort: sortBy === 'distance' ? { distance: 1 } : sortOptions },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'provider',
            foreignField: '_id',
            as: 'provider',
          },
        },
        { $unwind: '$provider' },
        {
          $project: {
            'provider.password': 0,
            'provider.resetPasswordToken': 0,
            'provider.resetPasswordExpire': 0,
          },
        },
      ]);

      const countResult = await Service.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)],
            },
            distanceField: 'distance',
            maxDistance: Number(radius) * 1000,
            spherical: true,
            query: query,
          },
        },
        { $count: 'total' },
      ]);

      total = countResult[0]?.total || 0;
    } else {
      services = await Service.find(query)
        .populate('provider', 'fullName email phone profileImage rating isVerified')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      total = await Service.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
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

// @desc    Get single service by ID
// @route   GET /api/v1/skills/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'fullName email phone profileImage rating totalReviews isVerified address createdAt');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service',
      error: error.message,
    });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/v1/skills/services/:id/reviews
// @access  Public
exports.getServiceReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    let sortOptions;
    switch (sortBy) {
      case 'highest':
        sortOptions = { rating: -1 };
        break;
      case 'lowest':
        sortOptions = { rating: 1 };
        break;
      case 'helpful':
        sortOptions = { helpfulCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ service: req.params.id })
      .populate('reviewer', 'fullName profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ service: req.params.id });

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { service: require('mongoose').Types.ObjectId(req.params.id) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      ratingBreakdown,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message,
    });
  }
};

// @desc    Get all categories with counts
// @route   GET /api/v1/skills/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message,
    });
  }
};

// @desc    Create a booking
// @route   POST /api/v1/skills/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      duration,
      customerAddress,
      customerPhone,
      customerLocation,
      description,
      paymentMethod,
    } = req.body;

    // Get the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This service is currently not accepting bookings',
      });
    }

    // Calculate total amount
    const totalAmount = service.pricePerHour * (duration || 1);
    const advancePayment = Math.ceil(totalAmount * 0.2); // 20% advance

    const newBooking = await SkillBooking.create({
      service: serviceId,
      provider: service.provider,
      customer: req.user._id,
      scheduledDate,
      scheduledTime,
      duration: duration || 1,
      customerLocation: {
        type: 'Point',
        coordinates: customerLocation.coordinates,
      },
      customerAddress,
      customerPhone,
      description,
      totalAmount,
      advancePayment,
      paymentMethod: paymentMethod || 'cash',
    });

    // Update service booking count
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { totalBookings: 1 },
    });

    const populatedBooking = await SkillBooking.findById(newBooking._id)
      .populate('service', 'title category pricePerHour')
      .populate('provider', 'fullName phone')
      .populate('customer', 'fullName phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message,
    });
  }
};

// @desc    Get user's bookings (as customer)
// @route   GET /api/v1/skills/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await SkillBooking.find(query)
      .populate('service', 'title category pricePerHour images')
      .populate('provider', 'fullName phone profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message,
    });
  }
};

// @desc    Add review for a completed booking
// @route   POST /api/v1/skills/bookings/:bookingId/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const bookingId = req.params.bookingId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user is the customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking',
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    const review = await Review.create({
      service: booking.service,
      booking: bookingId,
      reviewer: req.user._id,
      provider: booking.provider,
      rating,
      title,
      comment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'fullName profileImage');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: error.message,
    });
  }
};
