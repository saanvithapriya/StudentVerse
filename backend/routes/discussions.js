const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/discussions
// @desc    Get all discussions with sorting/filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { tab = 'Latest', tag } = req.query;
        let query = {};
        
        // Filter by tag if selected
        if (tag && tag !== 'All') {
            query.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
        }

        // Handle tabs
        if (tab === 'Unanswered') {
            query.answers = { $size: 0 };
        }

        let sortOption = { createdAt: -1 }; // Default to Latest
        if (tab === 'Trending') {
            sortOption = { likes: -1, createdAt: -1 };
        }

        let discussions = await Discussion.find(query).sort(sortOption).lean();
        
        // Map the answers array to an integer length for the list view
        discussions = discussions.map(post => ({
            ...post,
            answersCount: post.answers ? post.answers.length : 0
        }));

        res.json(discussions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/discussions/:id
// @desc    Get single discussion post by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }
        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/discussions
// @desc    Create a new discussion
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t) : []);

        const discussion = await Discussion.create({
            title, content, author: user._id, authorName: user.name, tags: tagsArray
        });
        res.status(201).json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/discussions/:id/answers
// @desc    Add an answer to a discussion
// @access  Private
router.post('/:id/answers', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const newAnswer = {
            content,
            author: user._id,
            authorName: user.name
        };

        discussion.answers.push(newAnswer);
        await discussion.save();

        res.status(201).json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/discussions/:id/answers/:answerId/replies
// @desc    Add a nested reply to an answer
// @access  Private
router.post('/:id/answers/:answerId/replies', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        const answer = discussion.answers.id(req.params.answerId);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        const newReply = {
            content,
            author: user._id,
            authorName: user.name
        };

        answer.replies.push(newReply);
        await discussion.save();

        res.status(201).json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/discussions/:id/like
// @desc    Increment likes
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        const discussion = await Discussion.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        res.json(discussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/discussions/:id
// @desc    Admin delete a discussion
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) return res.status(403).json({ message: 'Access denied. Admins only.' });

        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        await discussion.deleteOne();
        res.json({ message: 'Discussion removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
