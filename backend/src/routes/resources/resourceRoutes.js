const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getMyItems,
} = require('../../controllers/resources/resourceController');
const {
  smartSearch,
  pricingAssistant,
  bundleRecommendation
} = require('../../controllers/resources/aiResourceController');

// Public
router.get('/', listResources);
router.get('/my-items', protect, getMyItems);
router.get('/:id', getResource);

// AI Routes
router.post('/ai/smart-search', smartSearch);
router.post('/ai/pricing', pricingAssistant);
router.get('/ai/bundle/:resourceId', bundleRecommendation);

// Private
router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
