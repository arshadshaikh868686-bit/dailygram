const express = require('express')
const router = express.Router()

const {MentorSearch} = require('../Controller/searchMentors')
const protect = require('../Middleware/authMiddleware')

router.get('/mentors', protect, MentorSearch)


module.exports = router