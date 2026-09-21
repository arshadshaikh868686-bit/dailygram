const mongoose = require('mongoose');
const Appointment = require('../Modules/Appointment');
const User = require('../Modules/User');
const { getIO, onlineusers } = require('../socket');

exports.Booking = async (req, res) => {
    try {
        const { mentorId, skill } = req.body;
        const learnerId = req.user._id;

        if (!mentorId || !skill) return res.status(400).json({ message: 'mentorId and skill are required' });
        if (!mongoose.isValidObjectId(mentorId)) return res.status(400).json({ message: 'Invalid mentorId' });
        if (String(mentorId) === String(learnerId)) return res.status(400).json({ message: 'You cannot book yourself' });

        const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
        if (!mentor.skills.includes(skill)) return res.status(400).json({ message: 'Mentor does not offer this skill' });

        const existing = await Appointment.findOne({ learnerId, mentorId, skill, status: { $in: ['pending', 'accepted'] } });
        if (existing) return res.status(409).json({ message: 'An active appointment already exists', appointment: existing });

        const appointment = await Appointment.create({ learnerId, mentorId, skill });
        if (onlineusers[String(mentorId)]) getIO().to(onlineusers[String(mentorId)]).emit('newRequest', appointment);

        res.status(201).json(appointment);
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.Myrequest = async (req, res) => {
    try {
        const requests = await Appointment.find({ mentorId: req.user._id, status: 'pending' })
            .populate('learnerId', 'name email skills')
            .populate('mentorId', 'name email skills')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.MyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [{ learnerId: req.user._id }, { mentorId: req.user._id }]
        })
            .populate('learnerId', 'name email skills')
            .populate('mentorId', 'name email skills')
            .sort({ createdAt: -1 });
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.RespondRequest = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'status must be accepted or rejected' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.mentorId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized action' });
        if (appointment.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be responded to' });

        appointment.status = status;
        if (status === 'accepted') appointment.room = `dailygram-${appointment._id}`;
        await appointment.save();

        if (onlineusers[String(appointment.learnerId)]) {
            getIO().to(onlineusers[String(appointment.learnerId)]).emit('requestUpdate', appointment);
        }
        res.status(200).json(appointment);
    } catch (err) {
        console.error('RespondRequest error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
