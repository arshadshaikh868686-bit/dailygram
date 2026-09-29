const User = require('../Modules/User');

exports.getVerificationRequests = async (req, res) => {
    try {
        const mentors = await User.find({
            role: 'mentor',
            aadhaarVerificationStatus: {
                $in: ['pending', 'rejected']
            }
        })
            .select(
                '-password -aadhaarVerificationStatus'
            )
            .sort({ updatedAt: -1 });

        res.status(200).json(mentors);

    } catch (err) {
        console.error('Verification requests error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be verified or rejected'
            });
        }

        const user = await User.findOne({
            _id: id,
            role: 'mentor'
        });

        if (!user) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

        user.aadhaarVerificationStatus = status;

        // Premium eligibility is based on both verification and rating.
        if (status === 'verified' && user.rating >= 4.5) {
            user.premiumEligible = true;
        } else {
            user.premiumEligible = false;
        }

        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(200).json({
            message: `Mentor verification ${status} successfully`,
            user: safeUser
        });

    } catch (err) {
        console.error('Update verification status error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};


exports.updatePremiumStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                message: 'enabled must be true or false'
            });
        }

        const mentor = await User.findOne({
            _id: id,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

        // Premium can only be enabled for eligible mentors.
        if (enabled && !mentor.premiumEligible) {
            return res.status(403).json({
                message: 'Mentor is not eligible for premium'
            });
        }

        mentor.premiumEnabled = enabled;

        await mentor.save();

        const safeMentor = mentor.toObject();
        delete safeMentor.password;

        res.status(200).json({
            message: enabled
                ? 'Premium enabled successfully'
                : 'Premium disabled successfully',
            mentor: safeMentor
        });

    } catch (err) {
        console.error('Update premium status error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};


exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalMentors,
            totalLearners,
            pendingVerifications,
            verifiedMentors,
            premiumMentors
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'mentor' }),
            User.countDocuments({ role: 'learner' }),
            User.countDocuments({
                role: 'mentor',
                aadhaarVerificationStatus: 'pending'
            }),
            User.countDocuments({
                role: 'mentor',
                aadhaarVerificationStatus: 'verified'
            }),
            User.countDocuments({
                role: 'mentor',
                premiumEnabled: true
            })
        ]);

        res.status(200).json({
            totalUsers,
            totalMentors,
            totalLearners,
            pendingVerifications,
            verifiedMentors,
            premiumMentors
        });

    } catch (err) {
        console.error('Admin stats error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};