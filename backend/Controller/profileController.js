const User = require('../Modules/User');

exports.profileController = async (req, res) => {
    res.status(200).json(req.user);
};

exports.UpdateProfile = async (req, res) => {
    try {
        const { name, skills } = req.body;
        const update = {};
        if (name !== undefined) update.name = String(name).trim();
        if (skills !== undefined) {
            if (!Array.isArray(skills)) return res.status(400).json({ message: 'skills must be an array' });
            update.skills = skills;
        }
        if (update.name === '') return res.status(400).json({ message: 'name cannot be empty' });

        const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
