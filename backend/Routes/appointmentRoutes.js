const express = require('express');
const router = express.Router();
const protect = require('../Middleware/authMiddleware');
const { Booking, Myrequest, MyAppointments, RespondRequest } = require('../Controller/Booking');

router.post('/request', protect, Booking);
router.get('/my-requests', protect, Myrequest);
router.get('/my-appointments', protect, MyAppointments);
router.put('/:id/respond', protect, RespondRequest);

module.exports = router;
