const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        // ==========================================
        // BASIC
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ['mentor', 'learner', 'admin'],
            required: true
        },

        skills: [
            {
                type: String,
                trim: true
            }
        ],


        // ==========================================
        // PROFILE
        // ==========================================

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ''
        },

        experience: {
            type: Number,
            min: 0,
            default: 0
        },

        profileImage: {
            type: String,
            default: ''
        },

        linkedinUrl: {
            type: String,
            trim: true,
            default: ''
        },

        resumeUrl: {
            type: String,
            trim: true,
            default: ''
        },


        // ==========================================
        // PERFORMANCE
        // ==========================================

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },

        completedSessions: {
            type: Number,
            min: 0,
            default: 0
        },


        // ==========================================
        // VERIFICATION
        // ==========================================

        aadhaarVerificationStatus: {
            type: String,
            enum: [
                'not_submitted',
                'pending',
                'verified',
                'rejected'
            ],
            default: 'not_submitted'
        },


        // ==========================================
        // ADMIN APPROVAL
        // ==========================================

        mentorApproved: {
            type: Boolean,
            default: false
        },

        mentorApprovedAt: {
            type: Date,
            default: null
        },

        mentorApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },


        // ==========================================
        // MENTORSHIP PRICING
        // ==========================================

        /*
         * ₹0 = Free mentorship
         *
         * Any value above ₹0 = Paid mentorship
         *
         * Example:
         * 0    → Free
         * 299  → ₹299
         * 499  → ₹499
         * 999  → ₹999
         */

        mentorshipPrice: {
            type: Number,
            min: 0,
            default: 0
        },


        /*
         * Kept for compatibility with existing data.
         *
         * This field is NOT used to force a ₹1 first session.
         * Actual mentorship pricing will be decided by
         * the appointment/payment flow.
         */

        firstMentorshipPrice: {
            type: Number,
            min: 0,
            default: 0
        },


        // ==========================================
        // PREMIUM
        // ==========================================

        premiumEligible: {
            type: Boolean,
            default: false
        },

        premiumEnabled: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);


// ==========================================
// PASSWORD HASHING
// ==========================================

UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password =
        await bcrypt.hash(
            this.password,
            salt
        );

    next();
});


// ==========================================
// PASSWORD COMPARISON
// ==========================================

UserSchema.methods.comparePassword =
    async function (candidatePassword) {

        return bcrypt.compare(
            candidatePassword,
            this.password
        );
    };


module.exports =
    mongoose.model(
        'User',
        UserSchema
    );