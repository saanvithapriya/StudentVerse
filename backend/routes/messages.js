const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Build consistent threadId from two user IDs
const buildThreadId = (a, b) => [a, b].sort().join('_');

// @route   GET /api/messages/conversations
// @desc    Get all conversations (last message per thread) for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        // Get all distinct threads involving this user
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }).sort({ createdAt: -1 });

        // Group by threadId, keep only the last message per thread
        const threadMap = {};
        for (const msg of messages) {
            if (!threadMap[msg.threadId]) {
                threadMap[msg.threadId] = msg;
            }
        }

        // Enrich with other user info
        const conversations = await Promise.all(
            Object.values(threadMap).map(async (msg) => {
                const otherId = msg.sender.toString() === req.user.id
                    ? msg.receiver
                    : msg.sender;
                const other = await User.findById(otherId).select('name email');
                const unread = await Message.countDocuments({
                    threadId: msg.threadId,
                    receiver: req.user.id,
                    read: false
                });
                return {
                    threadId: msg.threadId,
                    otherUser: other,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unread,
                    isLastMine: msg.sender.toString() === req.user.id
                };
            })
        );

        // Sort by most recent
        conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count for badge
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/messages/:userId
// @desc    Get full conversation with a specific user
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const threadId = buildThreadId(req.user.id, req.params.userId);
        const messages = await Message.find({ threadId }).sort({ createdAt: 1 });

        // Mark messages sent to current user as read
        await Message.updateMany(
            { threadId, receiver: req.user.id, read: false },
            { read: true }
        );

        const otherUser = await User.findById(req.params.userId).select('name email');
        res.json({ messages, otherUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!receiverId || !content?.trim()) {
            return res.status(400).json({ message: 'receiverId and content are required' });
        }
        if (receiverId === req.user.id) {
            return res.status(400).json({ message: 'You cannot message yourself' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ message: 'User not found' });

        const sender = await User.findById(req.user.id);
        const threadId = buildThreadId(req.user.id, receiverId);

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content: content.trim(),
            threadId
        });

        // Notify receiver (only if they haven't been notified recently — check last msg)
        const recentNotif = await Notification.findOne({
            recipient: receiverId,
            type: 'new_message',
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 min window
        });

        if (!recentNotif) {
            await Notification.create({
                recipient: receiverId,
                type: 'new_message',
                title: '💬 New Message',
                message: `${sender.name} sent you a message`,
                link: `/messages/${req.user.id}`
            });
        }

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
