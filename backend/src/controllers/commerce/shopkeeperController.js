const Shop = require('../../models/commerce/Shop');
const Product = require('../../models/commerce/Product');
const Order = require('../../models/commerce/Order');

// Middleware mockup to get current shop attached to the user 
// Real app would verify req.user and find their associated shop
const getMyShop = async (userId) => {
    return await Shop.findOne({ owner: userId });
};

// @desc    Get shop inventory
// @route   GET /api/shopkeeper/inventory
// @access  Private/Shopkeeper
exports.getInventory = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : '65d1c2345678901234567891'; // Mock owner ID
        const shop = await getMyShop(userId);

        if (!shop) return res.status(404).json({ success: false, error: 'Shop not found for user' });

        const products = await Product.find({ shop: shop._id });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a product to inventory
// @route   POST /api/shopkeeper/inventory
// @access  Private/Shopkeeper
exports.addProduct = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : '65d1c2345678901234567891';
        const shop = await getMyShop(userId);

        if (!shop) return res.status(404).json({ success: false, error: 'Shop not found for user' });

        req.body.shop = shop._id;
        const product = await Product.create(req.body);

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all orders for the shop
// @route   GET /api/shopkeeper/orders
// @access  Private/Shopkeeper
exports.getShopOrders = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : '65d1c2345678901234567891';
        const shop = await getMyShop(userId);

        if (!shop) return res.status(404).json({ success: false, error: 'Shop not found for user' });

        const orders = await Order.find({ shop: shop._id }).populate('user', 'name email');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/shopkeeper/orders/:id/status
// @access  Private/Shopkeeper
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
