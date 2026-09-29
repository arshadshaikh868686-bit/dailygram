const express = require('express')

const router = express.Router()

const { MentorSearch } = require('../Controller/searchMentors')

const {
    profileController,
    UpdateProfile,
    getMentorProfile,
    submitMentorVerification
} = require('../Controller/profileController')


const protect = require('../Middleware/authMiddleware')

router.post(
    '/mentor/verification',
    protect,
    submitMentorVerification
);

router.get('/mentors', protect, MentorSearch)

router.get('/profile', protect, profileController)

router.put('/profile', protect, UpdateProfile)

router.get('/mentor/:id', protect, getMentorProfile)

module.exports = router