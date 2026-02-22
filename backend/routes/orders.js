const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create new order (Checkout)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, totalAmount } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            const order = new Order({
                buyer: req.user.id,
                buyerName: req.user.name || 'Student',
                products: orderItems,
                totalAmount
            });

            const createdOrder = await order.save();

            // Mark all these products as 'Sold'
            for (let item of orderItems) {
                await Product.findByIdAndUpdate(item.product, { status: 'Sold' });
            }

            res.status(201).json(createdOrder);
        }
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

module.exports = router;
