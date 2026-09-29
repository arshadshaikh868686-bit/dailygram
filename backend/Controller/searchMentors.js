const User = require('../Modules/User');


// ==========================================
// GET APPROVED MENTORS
// ==========================================

exports.MentorSearch = async (req, res) => {
    try {
        /*
         * Marketplace me sirf wahi mentors dikhenge
         * jinko admin ne approve kiya hai.
         *
         * Skill filter intentionally nahi hai.
         */

        const mentors = await User.find({
            role: 'mentor',
            mentorApproved: true
        })
            .select(
                'name skills bio experience profileImage rating completedSessions mentorshipPrice premiumEnabled'
            )
            .sort({
                rating: -1,
                completedSessions: -1,
                createdAt: -1
            });

        res.status(200).json(mentors);

    } catch (err) {
        console.error('Mentor search error:', err);

        res.status(500).json({
            message: 'Unable to fetch mentors'
        });
    }
};