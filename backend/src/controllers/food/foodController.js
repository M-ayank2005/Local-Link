const FoodListing = require('../../models/food/foodListingModel');
const FoodOrder = require('../../models/food/FoodOrder');

// @desc    Create a new food listing
// @route   POST /api/food
// @access  Private (resident, shopkeeper)
exports.createFoodListing = async (req, res) => {
  try {
    const { title, description, price, quantity, ingredients, season, expiryDate, coordinates } = req.body;

    const newFood = new FoodListing({
      title,
      description,
      provider: req.user._id, // Ensure we use _id
      price,
      quantity,
      ingredients,
      season,
      expiryDate,
      location: {
        type: 'Point',
        coordinates
      }
    });

    const savedFood = await newFood.save();
    res.status(201).json({ success: true, data: savedFood });

  } catch (error) {
    console.error('Error creating food listing:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single food listing by ID
// @route   GET /api/food/:id
// @access  Public
exports.getFoodById = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id).populate('provider', 'fullName phone');
    if (!food) return res.status(404).json({ success: false, message: 'Food listing not found' });
    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all available food listings
// @route   GET /api/food
// @access  Public
exports.getAvailableFood = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; 

    // Base query: Only show available items or items that are completely claimed but not picked up (optional, here we filter for available mainly)
    // Actually, user wants to see their posts too, so public feed usually shows 'available'.
    
    let query = {
      status: { $in: ['available'] }, // Only show available food in public feed to reduce clutter
      quantity: { $gt: 0 } // Ensure quantity > 0
    };

    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    const foods = await FoodListing.find(query)
        .populate('provider', 'fullName phone role') 
        .sort('-createdAt'); 

    res.status(200).json({ success: true, count: foods.length, data: foods });

  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Claim a food listing (Creates a FoodOrder)
// @route   PUT /api/food/:id/claim
// @access  Private (ngo, resident)
exports.claimFood = async (req, res) => {
  try {
    const { quantity } = req.body;
    const food = await FoodListing.findById(req.params.id);
    
    if (!food) return res.status(404).json({ success: false, message: 'Food listing not found' });
    if (food.status !== 'available') return res.status(400).json({ success: false, message: 'This food is no longer available' });

    // Prevent provider from claiming their own food
    if (food.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own food listing.' });
    }

    // Validate quantity
    const claimQty = quantity ? parseInt(quantity) : food.quantity;
    
    if (claimQty <= 0 || claimQty > food.quantity) {
      return res.status(400).json({ success: false, message: `Please enter a valid quantity (1 to ${food.quantity})` });
    }

    // 1. Create a FoodOrder
    const order = new FoodOrder({
      food: food._id,
      claimer: req.user._id,
      provider: food.provider,
      quantity: claimQty,
      status: 'claimed'
    });
    
    await order.save();

    // 2. Decrement original listing quantity
    food.quantity -= claimQty;
    
    // 3. Update status if fully claimed
    if (food.quantity === 0) {
      food.status = 'claimed';
    }
    
    await food.save();

    res.status(200).json({ success: true, message: `Successfully claimed ${claimQty} items!`, data: order });

  } catch (error) {
    console.error('Error claiming food:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get food listings posted by the logged-in user
// @route   GET /api/food/my-posts
// @access  Private
exports.getMyPosts = async (req, res) => {
  try {
    // Get the listings
    const posts = await FoodListing.find({ provider: req.user._id }).sort('-createdAt');
    
    // Also get the orders (claims) on these posts using aggregating or separate query
    // To make it simple for frontend, let's just return listings. 
    // We will create a new endpoint for fetching incoming orders/claims on my posts.
    
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching my posts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all active claims (incoming orders) for the logged-in provider
// @route   GET /api/food/my-incoming-orders
// @access  Private
exports.getIncomingOrders = async (req, res) => {
  try {
     const orders = await FoodOrder.find({ provider: req.user._id })
       .populate('food')
       .populate('claimer', 'fullName phone')
       .sort('-createdAt');
       
     res.status(200).json({ success: true, data: orders });
  } catch (error) {
     console.error('Error fetching incoming orders:', error);
     res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get orders claimed by the logged-in user (My Claims)
// @route   GET /api/food/my-claims
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await FoodOrder.find({ claimer: req.user._id })
      .populate({
        path: 'food',
        populate: { path: 'provider', select: 'fullName phone' }
      }) 
      .sort('-createdAt');
    
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    console.error('Error fetching my claims:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark a claimed order as picked up
// @route   PUT /api/food/order/:id/pickup
// @access  Private (resident, shopkeeper)
exports.markOrderPickedUp = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only the provider can mark it as picked up
    if (order.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = 'picked_up';
    order.pickedUpAt = Date.now();
    await order.save();
    
    res.status(200).json({ success: true, message: 'Marked as picked up!', data: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};