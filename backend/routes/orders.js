const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create new order (Checkout)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, totalAmount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Fetch user from DB to get the actual name
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = new Order({
            buyer: req.user.id,
            buyerName: user.name,
            products: orderItems,
            totalAmount
        });

        const createdOrder = await order.save();

        // Mark all these products as 'Sold'
        for (let item of orderItems) {
            await Product.findByIdAndUpdate(item.product, { status: 'Sold' });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user's orders (buyer)
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/orders/all
// @desc    Get ALL orders (admin only)
// @access  Private/Admin
router.get('/all', protect, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { status } = req.body;
        if (!['Active', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
