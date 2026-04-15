const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT (30 day expiry)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new student user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // College email validation: exactly 10 characters followed by @vnrvjiet.in
        const emailRegex = /^[a-zA-Z0-9]{10}@vnrvjiet\.in$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Only valid college emails matching **********@vnrvjiet.in format are allowed' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate student user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/admin-login
// @desc    Authenticate admin user with secret code (no email restriction)
// @access  Public
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password, adminSecret } = req.body;

        // Validate admin secret code
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'STUDENTVERSE_ADMIN_2024';
        if (adminSecret !== ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret code' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'This account does not have admin privileges' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/seed-admin
// @desc    Create the default admin account if none exists (run once)
// @access  Public (but checks for existing admin)
router.post('/seed-admin', async (req, res) => {
    try {
        const { name, email, password, adminSecret } = req.body;

        // Validate admin secret code
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'STUDENTVERSE_ADMIN_2024';
        if (adminSecret !== ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret code' });
        }

        // Check if any admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            return res.status(400).json({ message: 'An admin account already exists. Login at /admin-login.' });
        }

        // Check email not taken
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = await User.create({
            name: name || 'Admin',
            email,
            password: hashedPassword,
            isAdmin: true,
        });

        res.status(201).json({
            _id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            isAdmin: adminUser.isAdmin,
            token: generateToken(adminUser._id),
            message: 'Admin account created successfully. You can now log in at /admin-login.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile contacts
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            // Update name if provided
            if (req.body.name) {
                user.name = req.body.name;
            }

            if (req.body.contactInfo) {
                user.contactInfo = {
                    phone: req.body.contactInfo.phone !== undefined ? req.body.contactInfo.phone : user.contactInfo.phone,
                    linkedin: req.body.contactInfo.linkedin !== undefined ? req.body.contactInfo.linkedin : user.contactInfo.linkedin,
                    portfolio: req.body.contactInfo.portfolio !== undefined ? req.body.contactInfo.portfolio : user.contactInfo.portfolio
                };
            }
            
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', protect, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/users/:id/toggle-admin
// @desc    Toggle admin status for a user (admin only)
// @access  Private/Admin
router.put('/users/:id/toggle-admin', protect, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-demotion
        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot change your own admin status' });
        }

        targetUser.isAdmin = !targetUser.isAdmin;
        await targetUser.save();
        res.json({ message: `User ${targetUser.isAdmin ? 'promoted to' : 'removed from'} admin`, user: targetUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user account (admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
