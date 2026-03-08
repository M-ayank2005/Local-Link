const axios = require('axios');
const Resource = require('../../models/resources/Resource');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @desc    List resources near user, ML-ranked if possible
// @route   GET /api/v1/resources
// @access  Public
exports.listResources = async (req, res) => {
  try {
    const { lng, lat, distance = 5, category, available_from, available_to } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, error: 'Please provide lng and lat query params' });
    }

    const radius = distance / 6378.1;

    const filter = {
      isActive: true,
      location: { $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] } },
    };
    if (category) filter.category = category;
    if (available_from) filter.availableFrom = { $lte: new Date(available_from) };
    if (available_to) filter.availableTo = { $gte: new Date(available_to) };

    const resources = await Resource.find(filter).populate('owner', 'fullName rating totalReviews');

    // Best-effort ML re-ranking
    let mlRanked = false;
    let ranked = resources;
    const userId = req.user ? req.user._id.toString() : null;

    if (resources.length > 0) {
      try {
        const mlRes = await axios.post(
          `${ML_SERVICE_URL}/ml/recommend-resources`,
          {
            user_id: userId,
            location: { lng: parseFloat(lng), lat: parseFloat(lat) },
            candidate_item_ids: resources.map((r) => r._id.toString()),
            preferences: { category: category || null },
          },
          { timeout: 400 }
        );
        const scoreMap = {};
        (mlRes.data.ranked_items || []).forEach((item) => {
          scoreMap[item.item_id] = item.score;
        });
        ranked = [...resources].sort(
          (a, b) => (scoreMap[b._id.toString()] || 0) - (scoreMap[a._id.toString()] || 0)
        );
        ranked = ranked.map((r) => ({
          ...r.toObject(),
          ml_score: scoreMap[r._id.toString()] ?? null,
        }));
        mlRanked = true;
      } catch (_mlErr) {
        // ML unavailable — return unranked results gracefully
        ranked = resources.map((r) => ({ ...r.toObject(), ml_score: null }));
      }
    }

    res.status(200).json({ success: true, count: ranked.length, ml_ranked: mlRanked, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single resource detail + demand forecast
// @route   GET /api/v1/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'owner',
      'fullName rating totalReviews'
    );

    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    // Fetch booked date ranges for availability calendar
    const Booking = require('../../models/resources/Booking');
    const activeBookings = await Booking.find({
      resource: resource._id,
      status: { $in: ['confirmed', 'active'] },
    }).select('fromDate toDate');

    const bookedDates = activeBookings.map((b) => ({ from: b.fromDate, to: b.toDate }));

    // Best-effort demand forecast
    let mlDemandForecast = { predicted_bookings_next_7_days: null, confidence: null, source: 'unavailable' };
    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/ml/predict-demand`,
        {
          item_category: resource.category,
          location: {
            lng: resource.location.coordinates[0],
            lat: resource.location.coordinates[1],
          },
          week_start: new Date().toISOString().split('T')[0],
        },
        { timeout: 400 }
      );
      mlDemandForecast = { ...mlRes.data, source: 'ml-service' };
    } catch (_mlErr) {
      // ML unavailable — proceed without forecast
    }

    res.status(200).json({
      success: true,
      data: {
        ...resource.toObject(),
        bookedDates,
        ml_demand_forecast: mlDemandForecast,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a resource listing
// @route   POST /api/v1/resources
// @access  Private
exports.createResource = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const resource = await Resource.create({ ...req.body, owner: userId });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update own resource listing
// @route   PUT /api/v1/resources/:id
// @access  Private (owner only)
exports.updateResource = async (req, res) => {
  try {
    const userId = req.user ? req.user._id.toString() : null;
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    if (resource.owner.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Not your resource' });
    }

    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Soft-delete own resource (blocks if active bookings exist)
// @route   DELETE /api/v1/resources/:id
// @access  Private (owner only)
exports.deleteResource = async (req, res) => {
  try {
    const userId = req.user ? req.user._id.toString() : null;
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    if (resource.owner.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Not your resource' });
    }

    const Booking = require('../../models/resources/Booking');
    const activeCount = await Booking.countDocuments({
      resource: resource._id,
      status: { $in: ['confirmed', 'active'] },
    });
    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate — resource has active bookings',
      });
    }

    resource.isActive = false;
    await resource.save();

    res.status(200).json({ success: true, message: 'Resource deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all resources owned by logged-in user
// @route   GET /api/v1/resources/my-items
// @access  Private
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const Booking = require('../../models/resources/Booking');
    const resources = await Resource.find({ owner: userId });

    // Attach booking counts per resource
    const data = await Promise.all(
      resources.map(async (r) => {
        const activeBookings = await Booking.countDocuments({
          resource: r._id,
          status: { $in: ['confirmed', 'active'] },
        });
        return { ...r.toObject(), activeBookings };
      })
    );

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
