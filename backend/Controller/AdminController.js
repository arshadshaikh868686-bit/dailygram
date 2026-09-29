const User = require('../Modules/User');



exports.getVerificationRequests = async (req, res) => {
    try {
        const mentors = await User.find({
            role: 'mentor',
            aadhaarVerificationStatus: {
                $in: ['pending', 'rejected']
            }
        })
            .select('-password')
            .sort({ updatedAt: -1 });

        res.status(200).json(mentors);
    } catch (err) {
        console.error('Get verification requests error:', err);

        res.status(500).json({
            message: 'Unable to fetch verification requests'
        });
    }
};



exports.updateVerificationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be verified or rejected'
            });
        }

        const mentor = await User.findOne({
            _id: req.params.id,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

        mentor.aadhaarVerificationStatus = status;

       

        if (
            status === 'verified' &&
            mentor.rating >= 4.5
        ) {
            mentor.premiumEligible = true;
        } else {
            mentor.premiumEligible = false;

            
            if (status === 'rejected') {
                mentor.premiumEnabled = false;
            }
        }

        await mentor.save();

        const safeMentor = mentor.toObject();

        delete safeMentor.password;
        delete safeMentor.aadhaarVerificationStatus;

        res.status(200).json({
            message: `Mentor verification ${status} successfully`,
            user: safeMentor
        });

    } catch (err) {
        console.error('Update verification status error:', err);

        res.status(500).json({
            message: 'Unable to update verification status'
        });
    }
};



exports.updateMentorApproval = async (req, res) => {
    try {
        const { approved } = req.body;

        if (typeof approved !== 'boolean') {
            return res.status(400).json({
                message: 'approved must be true or false'
            });
        }

        const mentor = await User.findOne({
            _id: req.params.id,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

       

        if (
            approved &&
            mentor.aadhaarVerificationStatus !== 'verified'
        ) {
            return res.status(400).json({
                message: 'Mentor must be verified before marketplace approval'
            });
        }

        mentor.mentorApproved = approved;

        if (approved) {
            mentor.mentorApprovedAt = new Date();
            mentor.mentorApprovedBy = req.user._id;
        } else {
            mentor.mentorApprovedAt = null;
            mentor.mentorApprovedBy = null;
        }

        await mentor.save();

        const safeMentor = mentor.toObject();

        delete safeMentor.password;
        delete safeMentor.aadhaarVerificationStatus;

        res.status(200).json({
            message: approved
                ? 'Mentor approved for learner marketplace'
                : 'Mentor removed from learner marketplace',

            user: safeMentor
        });

    } catch (err) {
        console.error('Mentor approval error:', err);

        res.status(500).json({
            message: 'Unable to update mentor approval'
        });
    }
};




exports.updatePremiumStatus = async (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                message: 'enabled must be true or false'
            });
        }

        const mentor = await User.findOne({
            _id: req.params.id,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

    

        if (enabled && !mentor.premiumEligible) {
            return res.status(400).json({
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

            user: safeMentor
        });

    } catch (err) {
        console.error('Update premium status error:', err);

        res.status(500).json({
            message: 'Unable to update premium status'
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
            premiumMentors,
            approvedMentors
        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({
                role: 'mentor'
            }),

            User.countDocuments({
                role: 'learner'
            }),

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
            }),

            User.countDocuments({
                role: 'mentor',
                mentorApproved: true
            })
        ]);

        res.status(200).json({
            totalUsers,
            totalMentors,
            totalLearners,
            pendingVerifications,
            verifiedMentors,
            premiumMentors,
            approvedMentors
        });

    } catch (err) {
        console.error('Admin stats error:', err);

        res.status(500).json({
            message: 'Unable to fetch admin statistics'
        });
    }
};