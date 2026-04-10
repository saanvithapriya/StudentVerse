const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    contactInfo: {
        phone: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    }
});

module.exports = mongoose.model('User', userSchema);
