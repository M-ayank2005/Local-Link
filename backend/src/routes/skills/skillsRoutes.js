const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../../middlewares/authMiddleware');

const {
  getAllServices,
  getServiceById,
  getServiceReviews,
  getCategories,
  createBooking,
  getMyBookings,
  addReview,
} = require('../../controllers/skills/skillsController');

const {
  createService,
  updateService,
  deleteService,
  getMyServices,
  getProviderBookings,
  updateBookingStatus,
  getDashboardStats,
  toggleServiceStatus,
  updateAvailability,
  respondToReview,
} = require('../../controllers/skills/providerController');

const {
  getPricingSuggestion,
  generateJobDescription,
  getAvailabilitySuggestion,
  getDemandInsights,
} = require('../../controllers/skills/aiController');

// ============ PUBLIC ROUTES ============

// Get all services with filters, search, sort
router.get('/services', getAllServices);

// Get service categories with counts
router.get('/categories', getCategories);

// Get single service details
router.get('/services/:id', getServiceById);

// Get reviews for a service
router.get('/services/:id/reviews', getServiceReviews);

// ============ CUSTOMER ROUTES (Protected) ============

// Create a booking
router.post('/bookings', protect, createBooking);

// Get user's bookings as customer
router.get('/bookings/my', protect, getMyBookings);

// Add review for a completed booking
router.post('/bookings/:bookingId/review', protect, addReview);

// ============ PROVIDER ROUTES (Protected + Role-based) ============

// Provider Dashboard
router.get('/provider/dashboard', protect, authorizeRoles('service_provider', 'admin'), getDashboardStats);

// ── AI Assistant Routes ──────────────────────────────────────────────────────
// Suggest price range based on service / experience / location
router.post('/provider/ai/pricing', protect, authorizeRoles('service_provider', 'admin'), getPricingSuggestion);
// Generate a professional job description
router.post('/provider/ai/description', protect, authorizeRoles('service_provider', 'admin'), generateJobDescription);
// Suggest best availability slots from booking history
router.get('/provider/ai/availability', protect, authorizeRoles('service_provider', 'admin'), getAvailabilitySuggestion);
// Admin — demand trend insights
router.get('/admin/ai/demand-insights', protect, authorizeRoles('admin'), getDemandInsights);

// Provider Services
router.get('/provider/services', protect, authorizeRoles('service_provider', 'admin'), getMyServices);
router.post('/provider/services', protect, authorizeRoles('service_provider', 'admin'), createService);
router.put('/provider/services/:id', protect, authorizeRoles('service_provider', 'admin'), updateService);
router.delete('/provider/services/:id', protect, authorizeRoles('service_provider', 'admin'), deleteService);
router.put('/provider/services/:id/toggle', protect, authorizeRoles('service_provider', 'admin'), toggleServiceStatus);
router.put('/provider/services/:id/availability', protect, authorizeRoles('service_provider', 'admin'), updateAvailability);

// Provider Bookings
router.get('/provider/bookings', protect, authorizeRoles('service_provider', 'admin'), getProviderBookings);
router.put('/provider/bookings/:id/status', protect, authorizeRoles('service_provider', 'admin'), updateBookingStatus);

// Provider Reviews
router.put('/provider/reviews/:id/respond', protect, authorizeRoles('service_provider', 'admin'), respondToReview);

module.exports = router;
