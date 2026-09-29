const mongoose = require('mongoose');
const { decryptMessage } = require('../Utils/encryption');
const Appointment = require('../Modules/Appointment');
const Message = require('../Modules/Message');

exports.oldChats = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        if (!mongoose.isValidObjectId(appointmentId)) {
            return res.status(400).json({
                message: 'Invalid appointmentId'
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        const uid = String(req.user._id);

        if (
            uid !== String(appointment.learnerId) &&
            uid !== String(appointment.mentorId)
        ) {
            return res.status(403).json({
                message: 'Unauthorized'
            });
        }

        if (appointment.status !== 'accepted') {
            return res.status(403).json({
                message: 'Chat is available only for accepted appointments'
            });
        }

        const oldmessages = await Message.find({ appointmentId })
            .populate('senderId', 'name')
            .sort({ createdAt: 1 });

        oldmessages.forEach((message) => {
            try {
                message.text = decryptMessage(message.text);
            } catch (error) {
            
            }
        });

        res.status(200).json(oldmessages);

    } catch (err) {
        console.error('Old chats error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};