const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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

    skills: [{
        type: String,
        trim: true
    }],

    role: {
        type: String,
        enum: ['mentor', 'learner', 'admin'],
        required: true
    },
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

aadhaarVerificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'not_submitted'
},

premiumEligible: {
    type: Boolean,
    default: false
},

premiumEnabled: {
    type: Boolean,
    default: false
},

}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (typePassword) {
    return bcrypt.compare(typePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);