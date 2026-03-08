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

// Public
router.get('/', listResources);
router.get('/my-items', protect, getMyItems);
router.get('/:id', getResource);

// Private
router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
