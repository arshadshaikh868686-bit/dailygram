const User = require('../Modules/User');

exports.profileController = async (req, res) => {
    res.status(200).json(req.user);
};

exports.UpdateProfile = async (req, res) => {
    try {

        const {
    name,
    skills,
    role,
    bio,
    experience,
    profileImage,
    linkedinUrl,
    resumeUrl
} = req.body;

        const update = {};

        if (name !== undefined) {
            update.name = String(name).trim();
        }

        if (skills !== undefined) {
            if (!Array.isArray(skills)) {
                return res.status(400).json({
                    message: 'skills must be an array'
                });
            }

            update.skills = skills;
        }

        if (role !== undefined) {
            if (!['mentor', 'learner'].includes(role)) {
                return res.status(400).json({
                    message: 'role must be mentor or learner'
                });
            }

            update.role = role;
        }

        if (bio !== undefined) {
    update.bio = String(bio).trim();
}

if (experience !== undefined) {
    const value = Number(experience);

    if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
            message: 'experience must be a valid non-negative number'
        });
    }

    update.experience = value;
}

if (profileImage !== undefined) {
    update.profileImage = String(profileImage).trim();
}

if (linkedinUrl !== undefined) {
    update.linkedinUrl = String(linkedinUrl).trim();
}

if (resumeUrl !== undefined) {
    update.resumeUrl = String(resumeUrl).trim();
}


        if (update.name === '') {
            return res.status(400).json({
                message: 'name cannot be empty'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: update },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });

        

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
};

exports.getMentorProfile = async (req, res) => {
    try {
        const mentor = await User.findOne({
            _id: req.params.id,
            role: 'mentor'
        }).select(
            '-password -aadhaarVerificationStatus'
        );

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found'
            });
        }

        res.status(200).json(mentor);

    } catch (err) {
        res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.submitMentorVerification = async (req, res) => {
    try {
        const {
            linkedinUrl,
            resumeUrl
        } = req.body;

        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                message: 'Only mentors can submit verification'
            });
        }

        if (!linkedinUrl?.trim() || !resumeUrl?.trim()) {
            return res.status(400).json({
                message: 'LinkedIn URL and resume URL are required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    linkedinUrl: linkedinUrl.trim(),
                    resumeUrl: resumeUrl.trim(),
                    aadhaarVerificationStatus: 'pending'
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password -aadhaarVerificationStatus');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Verification submitted successfully',
            user
        });

    } catch (err) {
        console.error('Verification submission error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};