const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Other']
    },
    condition: {
        type: String,
        enum: ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },
    conditionDetails: {
        type: String,   // Free-text description of condition (scratches, defects, etc.)
        default: ''
    },
    image: {
        type: String,   // Path to uploaded image on server e.g. /uploads/products/xxx.jpg
        default: ''
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerEmail: {
        type: String,
        required: true
    },
    sellerPhone: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Available', 'Rejected', 'Sold'],
        default: 'Pending'   // All new products need admin approval
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
