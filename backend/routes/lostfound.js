const express = require('express');
const router = express.Router();
const LostFound = require('../models/LostFound');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { uploadProduct } = require('../middleware/uploadMiddleware');

const isAdminUser = async (userId) => {
    const u = await User.findById(userId);
    return u && u.isAdmin;
};

// @route   GET /api/lostfound
// @desc    Get all lost/found items (filter by type, category, status)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { type, category, status = 'active' } = req.query;
        const query = {};
        if (type && (type === 'lost' || type === 'found')) query.type = type;
        if (category && category !== 'All') query.category = category;
        if (status) query.status = status;

        const items = await LostFound.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/lostfound/my
// @desc    Get current user's own posts
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const items = await LostFound.find({ reporter: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/lostfound/:id
// @desc    Get single item
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lostfound
// @desc    Post a lost or found item
// @access  Private
router.post('/', protect, uploadProduct.single('image'), async (req, res) => {
    try {
        const { title, description, category, location, type, reporterPhone, dateLostFound } = req.body;
        const user = await User.findById(req.user.id);

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const item = await LostFound.create({
            title,
            description,
            category,
            location,
            type,
            image: imageUrl,
            reporter: user._id,
            reporterName: user.name,
            reporterEmail: user.email,
            reporterPhone: reporterPhone || '',
            dateLostFound: dateLostFound ? new Date(dateLostFound) : new Date(),
        });

        res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   PUT /api/lostfound/:id/resolve
// @desc    Mark item as resolved (owner or admin)
// @access  Private
router.put('/:id/resolve', protect, async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const isOwner = item.reporter.toString() === req.user.id;
        const admin = await isAdminUser(req.user.id);
        if (!isOwner && !admin) return res.status(403).json({ message: 'Not authorized' });

        item.status = 'resolved';
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/lostfound/:id
// @desc    Delete a post (owner or admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await LostFound.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const isOwner = item.reporter.toString() === req.user.id;
        const admin = await isAdminUser(req.user.id);
        if (!isOwner && !admin) return res.status(403).json({ message: 'Not authorized' });

        await item.deleteOne();
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
