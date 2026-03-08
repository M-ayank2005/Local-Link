const express = require('express');
const router = express.Router();
const foodController = require('../../controllers/food/foodController');
const { protect, authorizeRoles } = require('../../middlewares/authMiddleware'); 

// 1. PUBLIC ROUTES
router.get('/', foodController.getAvailableFood);

// 2. PROTECTED SPECIFIC ROUTES (Must be above /:id)
router.get('/my-posts', protect, foodController.getMyPosts);
router.get('/my-claims', protect, foodController.getMyClaims);
router.get('/my-incoming-orders', protect, foodController.getIncomingOrders);

// 3. PROTECTED POST ROUTE
router.post('/', protect, authorizeRoles('resident', 'shopkeeper'), foodController.createFoodListing);

// 4. PROTECTED ID ROUTES (must be after named specific routes)
router.get('/:id', foodController.getFoodById);
router.put('/:id/claim', protect, authorizeRoles('ngo', 'resident'), foodController.claimFood);
router.put('/order/:id/pickup', protect, authorizeRoles('resident', 'shopkeeper'), foodController.markOrderPickedUp);

module.exports = router;