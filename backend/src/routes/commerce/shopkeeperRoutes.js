const express = require('express');
const {
    getInventory,
    addProduct,
    getShopOrders,
    updateOrderStatus
} = require('../../controllers/commerce/shopkeeperController');

const router = express.Router();

router.route('/inventory')
    .get(getInventory)
    .post(addProduct);

router.route('/orders')
    .get(getShopOrders);

router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
