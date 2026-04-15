const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// @route   POST /api/notes
// @desc    Upload a new note (pending approval)
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, subject, semester, tags } = req.body;
        
        let tagsArray = [];
        if (tags) {
            try {
                tagsArray = JSON.parse(tags);
            } catch (e) {
                tagsArray = tags.split(',').map(tag => tag.trim()).filter(t => t);
            }
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const note = await Note.create({
            title,
            subject,
            semester,
            tags: tagsArray,
            uploader: user._id,
            uploaderName: user.name,
            fileUrl: `/uploads/${req.file.filename}`
        });

        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/notes
// @desc    Get all APPROVED notes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ isApproved: true }).sort('-createdAt');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notes/my
// @desc    Get logged-in user's own notes (all statuses)
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const notes = await Note.find({ uploader: req.user.id }).sort('-createdAt');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notes/pending
// @desc    Get all PENDING notes (admin only)
// @access  Private/Admin
router.get('/pending', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const notes = await Note.find({ isApproved: false }).sort('-createdAt');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id/approve
// @desc    Approve a pending note (admin only)
// @access  Private/Admin
router.put('/:id/approve', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.isApproved = true;
        await note.save();

        // Notify uploader
        await Notification.create({
            recipient: note.uploader,
            type: 'note_approved',
            title: '📄 Note Approved!',
            message: `Your note "${note.title}" has been approved and is now available to all students.`,
            link: `/notes`
        });

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notes/:id/reject
// @desc    Reject and delete a note (admin only)
// @access  Private/Admin
router.delete('/:id/reject', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Delete the file
        const filePath = path.join(__dirname, '../', note.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await note.deleteOne();
        res.json({ message: 'Note rejected and removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete own note (uploader or admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const requestingUser = await User.findById(req.user.id);
        const isOwner = note.uploader.toString() === req.user.id;
        const isAdmin = requestingUser && requestingUser.isAdmin;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        // Delete the file
        const filePath = path.join(__dirname, '../', note.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notes/:id/download
// @desc    Increment downloads counter
// @access  Public
router.put('/:id/download', async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id, 
            { $inc: { downloads: 1 } },
            { new: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
