const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Clothing', 'ID & Cards', 'Keys', 'Bags', 'Accessories', 'Other']
    },
    location: { type: String, required: true },   // Where it was lost/found
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    image: { type: String, default: '' },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    reporterPhone: { type: String, default: '' },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    dateLostFound: { type: Date },   // When the item was lost or found
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);
