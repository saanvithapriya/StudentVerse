const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const { uploadProduct } = require('../middleware/uploadMiddleware');

// ─── helpers ─────────────────────────────────────────────────────────────────

const isAdminUser = async (userId) => {
    const u = await User.findById(userId);
    return u && u.isAdmin;
};

const deleteProductImage = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith('/uploads/products/')) return;
    const filePath = path.join(__dirname, '../', imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// @route   GET /api/products
// @desc    Get all AVAILABLE products with optional search/filter
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, condition, sort } = req.query;
        const query = { status: 'Available' };

        if (category && category !== 'All') query.category = category;
        if (condition) {
            const conditions = condition.split(',').filter(Boolean);
            if (conditions.length > 0) query.condition = { $in: conditions };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };

        const products = await Product.find(query).sort(sortObj);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ─── ADMIN-ONLY ROUTES (before /:id so they don't get swallowed) ─────────────

// @route   GET /api/products/admin/all
// @desc    Get ALL products regardless of status (admin only)
// @access  Private/Admin
router.get('/admin/all', protect, async (req, res) => {
    try {
        if (!await isAdminUser(req.user.id)) return res.status(403).json({ message: 'Access denied.' });
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/products/admin/pending
// @desc    Get all PENDING products (awaiting approval)
// @access  Private/Admin
router.get('/admin/pending', protect, async (req, res) => {
    try {
        if (!await isAdminUser(req.user.id)) return res.status(403).json({ message: 'Access denied.' });
        const products = await Product.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/products/:id/approve
// @desc    Admin approves a pending product
// @access  Private/Admin
router.put('/:id/approve', protect, async (req, res) => {
    try {
        if (!await isAdminUser(req.user.id)) return res.status(403).json({ message: 'Access denied.' });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        product.status = 'Available';
        product.rejectionReason = '';
        await product.save();

        // Notify seller
        await Notification.create({
            recipient: product.seller,
            type: 'product_approved',
            title: '✅ Listing Approved!',
            message: `Your listing "${product.title}" has been approved and is now live in the marketplace.`,
            link: `/item/${product._id}`
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/products/:id/reject
// @desc    Admin rejects a pending product
// @access  Private/Admin
router.put('/:id/reject', protect, async (req, res) => {
    try {
        if (!await isAdminUser(req.user.id)) return res.status(403).json({ message: 'Access denied.' });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const reason = req.body.reason || 'Does not meet marketplace guidelines';
        product.status = 'Rejected';
        product.rejectionReason = reason;
        await product.save();

        // Notify seller
        await Notification.create({
            recipient: product.seller,
            type: 'product_rejected',
            title: '❌ Listing Rejected',
            message: `Your listing "${product.title}" was rejected. Reason: ${reason}`,
            link: `/profile`
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ─── USER ROUTES (before /:id) ────────────────────────────────────────────────

// @route   GET /api/products/my
// @desc    Get logged-in user's own products (all statuses)
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ─── SINGLE PRODUCT ───────────────────────────────────────────────────────────

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ─── CREATE ───────────────────────────────────────────────────────────────────

// @route   POST /api/products
// @desc    Create a product (submits for admin approval, uploads image file)
// @access  Private
router.post('/', protect, uploadProduct.single('image'), async (req, res) => {
    try {
        const { title, description, price, category, condition, conditionDetails, sellerEmail, sellerPhone } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Build image URL from uploaded file
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const product = new Product({
            title,
            description,
            price: parseFloat(price),
            category,
            condition: condition || 'Good',
            conditionDetails: conditionDetails || '',
            image: imageUrl,
            seller: user._id,
            sellerName: user.name,
            sellerEmail: sellerEmail || user.email,
            sellerPhone: sellerPhone || '',
            status: 'Pending',   // always starts pending
        });

        const created = await product.save();
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

// @route   DELETE /api/products/:id
// @desc    Delete a product (owner or admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const isOwner = product.seller.toString() === req.user.id;
        const admin = await isAdminUser(req.user.id);

        if (!isOwner && !admin) return res.status(401).json({ message: 'Not authorized' });

        deleteProductImage(product.image);
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─── MARK AS SOLD ─────────────────────────────────────────────────────────────

// @route   PUT /api/products/:id/buy
// @desc    Mark product as sold
// @access  Private
router.put('/:id/buy', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        product.status = 'Sold';
        await product.save();
        res.json({ message: 'Product purchased successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
