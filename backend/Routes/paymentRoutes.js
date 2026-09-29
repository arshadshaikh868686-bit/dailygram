const express = require('express');

const router = express.Router();

const protect = require('../Middleware/authMiddleware');

const {
    createPremiumOrder,
    verifyPremiumPayment
} = require('../Controller/PaymentController');

router.post(
    '/premium/order',
    protect,
    createPremiumOrder
);

router.post(
    '/premium/verify',
    protect,
    verifyPremiumPayment
);

module.exports = router;