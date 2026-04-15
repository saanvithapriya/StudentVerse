const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewerName: { type: String, required: true },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productTitle: { type: String, default: '' },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// One review per product per reviewer
reviewSchema.index({ reviewer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
