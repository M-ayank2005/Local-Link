const Shop = require('../../models/commerce/Shop');

// @desc    Get all shops (pending & verified)
// @route   GET /api/admin/shops
// @access  Private/Admin
exports.getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find().populate('owner', 'name email');
        res.status(200).json({ success: true, count: shops.length, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Verify a shop
// @route   PUT /api/admin/shops/:id/verify
// @access  Private/Admin
exports.verifyShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true, runValidators: true }
        );

        if (!shop) {
            return res.status(404).json({ success: false, error: 'Shop not found' });
        }

        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a new shop (Admin override)
// @route   POST /api/admin/shops
// @access  Private/Admin
exports.addShop = async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        res.status(201).json({ success: true, data: shop });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
