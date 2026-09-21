const User = require('../Modules/User');

const MentorSearch = async (req, res) => {
    try {
        const skills = req.query.skills;
        const filter = { role: 'mentor', _id: { $ne: req.user._id } };
        if (skills) filter.skills = skills;
        const mentors = await User.find(filter).select('-password').sort({ name: 1 });
        res.status(200).json(mentors);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { MentorSearch };
