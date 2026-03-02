const Shop = require('../../models/commerce/Shop');
const Product = require('../../models/commerce/Product');
const Order = require('../../models/commerce/Order');

// @desc    Get nearby shops
// @route   GET /api/commerce/shops
// @access  Public (or Private if users must be logged in to see them)
exports.getNearbyShops = async (req, res) => {
    try {
        const { lng, lat, distance = 5 } = req.query; // default 5km

        if (!lng || !lat) {
            return res.status(400).json({ success: false, error: 'Please provide longitude and latitude' });
        }

        const radius = distance / 6378.1; // Convert distance to radians (radius of Earth in km)

        const shops = await Shop.find({
            location: {
                $geoWithin: { $centerSphere: [[lng, lat], radius] }
            },
            status: 'open',
            isVerified: true
        });

        res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single shop's full inventory
// @route   GET /api/commerce/shops/:id
// @access  Public
exports.getShopAndInventory = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ success: false, error: 'Shop not found' });
        }

        const products = await Product.find({ shop: req.params.id });

        res.status(200).json({ success: true, data: { shop, products } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Place a new order
// @route   POST /api/commerce/orders
// @access  Private
exports.placeOrder = async (req, res) => {
    try {
        const { shop, items, totalAmount, deliveryType, paymentMethod, deliveryAddress } = req.body;

        // For now mocking user ID since auth isn't fully set up
        const userId = req.user ? req.user.id : '65d1c2345678901234567890';

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No order items' });
        }

        const order = await Order.create({
            user: userId,
            shop,
            items,
            totalAmount,
            deliveryType,
            paymentMethod,
            deliveryAddress
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/commerce/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : '65d1c2345678901234567890';
        const orders = await Order.find({ user: userId }).populate('shop', 'name address');

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
