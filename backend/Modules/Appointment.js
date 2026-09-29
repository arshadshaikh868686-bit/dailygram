const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
    {
        learnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed'],
            default: 'pending'
        },

        skill: {
            type: String,
            required: true,
            trim: true
        },

        scheduledAt: {
            type: Date
        },

        duration: {
            type: Number,
            default: 60,
            min: 15,
            max: 180
        },

        // Price agreed for this particular appointment.
        // 0 means free mentorship.
        mentorshipPrice: {
            type: Number,
            min: 0,
            default: 0
        },

        // Tracks whether learner needs to pay for this appointment.
        paymentStatus: {
            type: String,
            enum: ['not_required', 'pending', 'paid', 'failed', 'refunded'],
            default: 'not_required'
        },

        // Razorpay order/payment references for paid mentorship.
        paymentOrderId: {
            type: String,
            default: '',
            trim: true
        },

        paymentId: {
            type: String,
            default: '',
            trim: true
        },

        room: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;