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
        enum: ['mentor', 'learner'],
        required: true
    }

}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (typePassword) {
    return bcrypt.compare(typePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);