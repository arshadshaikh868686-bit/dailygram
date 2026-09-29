const express = require('express');

const router = express.Router();

const protect = require('../Middleware/authMiddleware');
const adminProtect = require('../Middleware/adminMiddleware');

const {
    getVerificationRequests,
    updateVerificationStatus,
    updatePremiumStatus,
    getAdminStats
} = require('../Controller/AdminController');





router.get(
    '/verification-requests',
    protect,
    adminProtect,
    getVerificationRequests
);

router.put(
    '/verification/:id',
    protect,
    adminProtect,
    updateVerificationStatus
);

router.put(
    '/premium/:id',
    protect,
    adminProtect,
    updatePremiumStatus
);

router.get(
    '/stats',
    protect,
    adminProtect,
    getAdminStats
);

module.exports = router;