const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Contains id from payload
            return next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed. Reason: ' + error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware: must be used AFTER protect
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.isAdmin) {
            return next();
        }
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error checking admin status' });
    }
};

module.exports = { protect, isAdmin };
