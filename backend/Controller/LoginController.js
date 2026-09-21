const User = require('../Modules/User');
const jwt = require('jsonwebtoken');

const LoginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required' });

        const findUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (!findUser) return res.status(401).json({ message: 'Invalid email or password' });
        const isPasswordMatch = await findUser.comparePassword(password);
        if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ userid: findUser._id }, process.env.JWT_SECRET, { expiresIn: '7h' });
        res.status(200).json({ token, userid: findUser._id, name: findUser.name, email: findUser.email, role: findUser.role, skills: findUser.skills });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = { LoginController };
