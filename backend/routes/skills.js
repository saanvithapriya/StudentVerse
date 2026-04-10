const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/skills
// @desc    Get skills with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, category } = req.query;
        let query = {};
        
        if (type && type !== 'all') {
            query.type = type;
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const skills = await Skill.find(query).populate('author', 'contactInfo name email').sort({ createdAt: -1 });
        res.json(skills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/skills
// @desc    Create a new skill offer/request
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { type, title, category, level, description } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const skill = await Skill.create({
            type,
            title,
            category,
            level: level || 'Intermediate',
            description,
            author: user._id,
            authorName: user.name
        });

        res.status(201).json(skill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
