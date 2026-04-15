const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/reviews/seller/:sellerId
// @desc    Get all reviews for a seller + aggregate rating
// @access  Public
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const reviews = await Review.find({ seller: req.params.sellerId }).sort({ createdAt: -1 });
        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
        res.json({ reviews, avgRating: avgRating ? parseFloat(avgRating) : null, count: reviews.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reviews/product/:productId
// @desc    Check if current user already reviewed this product
// @access  Private
router.get('/product/:productId', protect, async (req, res) => {
    try {
        const existing = await Review.findOne({ reviewer: req.user.id, product: req.params.productId });
        res.json({ reviewed: !!existing, review: existing });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Submit a seller review
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { sellerId, productId, rating, comment } = req.body;

        if (!sellerId || !productId || !rating) {
            return res.status(400).json({ message: 'sellerId, productId, and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be 1-5' });
        }

        // Cannot review yourself
        if (sellerId === req.user.id) {
            return res.status(400).json({ message: 'You cannot review yourself' });
        }

        const reviewer = await User.findById(req.user.id);
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check for existing review
        const existing = await Review.findOne({ reviewer: req.user.id, product: productId });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            reviewer: req.user.id,
            reviewerName: reviewer.name,
            seller: sellerId,
            product: productId,
            productTitle: product.title,
            rating: parseInt(rating),
            comment: comment || ''
        });

        // Notify seller
        await Notification.create({
            recipient: sellerId,
            type: 'new_review',
            title: '⭐ New Review Received',
            message: `${reviewer.name} gave you a ${rating}-star review for "${product.title}"`,
            link: `/item/${productId}`
        });

        res.status(201).json(review);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete own review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findOne({ _id: req.params.id, reviewer: req.user.id });
        if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
