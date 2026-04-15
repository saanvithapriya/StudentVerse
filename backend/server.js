const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const noteRoutes = require('./routes/notes');
const discussionRoutes = require('./routes/discussions');
const skillRoutes = require('./routes/skills');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const lostFoundRoutes = require('./routes/lostfound');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/messages', messageRoutes);

// Simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('CRITICAL: MongoDB connection error. Check your connection string and IP whitelist:', err.message);
        process.exit(1); // Stop the server from starting to make it obvious
    });
