const express = require('express');
const {
    getAllShops,
    verifyShop,
    addShop
} = require('../../controllers/commerce/adminController');

const router = express.Router();

router.route('/shops')
    .get(getAllShops)
    .post(addShop);

router.put('/shops/:id/verify', verifyShop);

module.exports = router;
