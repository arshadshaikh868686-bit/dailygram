const mongoose = require('mongoose');
const Appointment = require('../Modules/Appointment');
const User = require('../Modules/User');
const { getIO, onlineusers } = require('../socket');

exports.Booking = async (req, res) => {
    try {
        const { mentorId, skill, scheduledAt, duration } = req.body;
        const learnerId = req.user._id;

        if (!mentorId || !skill) {
            return res.status(400).json({
                message: 'mentorId and skill are required'
            });
        }

        if (!scheduledAt) {
            return res.status(400).json({
                message: 'scheduledAt is required'
            });
        }

        const appointmentDate = new Date(scheduledAt);

        if (Number.isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid scheduledAt'
            });
        }

        if (appointmentDate <= new Date()) {
            return res.status(400).json({
                message: 'Appointment must be scheduled in the future'
            });
        }

        const appointmentDuration =
            duration === undefined ? 60 : Number(duration);

        if (
            !Number.isFinite(appointmentDuration) ||
            appointmentDuration < 15 ||
            appointmentDuration > 180
        ) {
            return res.status(400).json({
                message: 'duration must be between 15 and 180 minutes'
            });
        }

        if (!mongoose.isValidObjectId(mentorId)) {
            return res.status(400).json({
                message: 'Invalid mentorId'
            });
        }

        if (String(mentorId) === String(learnerId)) {
            return res.status(400).json({
                message: 'You cannot book yourself'
            });
        }

        // Only admin-approved mentors can receive appointment requests.
        const mentor = await User.findOne({
            _id: mentorId,
            role: 'mentor',
            mentorApproved: true
        });

        if (!mentor) {
            return res.status(404).json({
                message: 'Mentor not found or not approved'
            });
        }

        // Keep the existing skill validation.
        if (!mentor.skills.includes(skill)) {
            return res.status(400).json({
                message: 'Mentor does not offer this skill'
            });
        }

        const existing = await Appointment.findOne({
            learnerId,
            mentorId,
            skill,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existing) {
            return res.status(409).json({
                message: 'An active appointment already exists',
                appointment: existing
            });
        }

        // Snapshot the mentor's current price.
        // ₹0 means free mentorship.
        const mentorshipPrice = Math.max(
            0,
            Math.round(Number(mentor.mentorshipPrice || 0))
        );

        const appointment = await Appointment.create({
            learnerId,
            mentorId,
            skill,
            scheduledAt: appointmentDate,
            duration: appointmentDuration,
            mentorshipPrice,
            paymentStatus:
                mentorshipPrice === 0 ? 'not_required' : 'pending'
        });

        if (onlineusers[String(mentorId)]) {
            getIO()
                .to(onlineusers[String(mentorId)])
                .emit('newRequest', appointment);
        }

        res.status(201).json(appointment);
    } catch (err) {
        console.error('Booking error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.Myrequest = async (req, res) => {
    try {
        const requests = await Appointment.find({
            mentorId: req.user._id,
            status: 'pending'
        })
            .populate('learnerId', 'name email skills')
            .populate(
                'mentorId',
                'name email skills mentorshipPrice mentorApproved'
            )
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (err) {
        console.error('Myrequest error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.MyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [
                { learnerId: req.user._id },
                { mentorId: req.user._id }
            ]
        })
            .populate('learnerId', 'name email skills')
            .populate(
                'mentorId',
                'name email skills mentorshipPrice mentorApproved'
            )
            .sort({ createdAt: -1 });

        res.status(200).json(appointments);
    } catch (err) {
        console.error('MyAppointments error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.RespondRequest = async (req, res) => {
    try {
        const { status, mentorshipPrice } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'status must be accepted or rejected'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        if (String(appointment.mentorId) !== String(req.user._id)) {
            return res.status(403).json({
                message: 'Unauthorized action'
            });
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                message: 'Only pending requests can be responded to'
            });
        }

        if (status === 'rejected') {
            appointment.status = 'rejected';
            appointment.paymentStatus = 'not_required';
        }

        if (status === 'accepted') {
            let finalPrice = appointment.mentorshipPrice;

            // Mentor can update the price while accepting the request.
            if (mentorshipPrice !== undefined) {
                const parsedPrice = Number(mentorshipPrice);

                if (
                    !Number.isFinite(parsedPrice) ||
                    parsedPrice < 0
                ) {
                    return res.status(400).json({
                        message: 'Mentorship price must be 0 or greater'
                    });
                }

                finalPrice = Math.round(parsedPrice);
            }

            appointment.mentorshipPrice = finalPrice;

            if (finalPrice === 0) {
                appointment.status = 'accepted';
                appointment.paymentStatus = 'not_required';
                appointment.paymentOrderId = '';
                appointment.paymentId = '';
            } else {
                appointment.status = 'accepted';
                appointment.paymentStatus = 'pending';
            }

            appointment.room = `dailygram-${appointment._id}`;
        }

        await appointment.save();

        if (onlineusers[String(appointment.learnerId)]) {
            getIO()
                .to(onlineusers[String(appointment.learnerId)])
                .emit('requestUpdate', appointment);
        }

        res.status(200).json(appointment);
    } catch (err) {
        console.error('RespondRequest error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
};