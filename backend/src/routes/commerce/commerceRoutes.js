const express = require('express');
const {
    getNearbyShops,
    getShopAndInventory,
    placeOrder,
    getMyOrders
} = require('../../controllers/commerce/commerceController');

const router = express.Router();

router.get('/shops', getNearbyShops);
router.get('/shops/:id', getShopAndInventory);
router.route('/orders')
    .post(placeOrder)
    .get(getMyOrders);

module.exports = router;
