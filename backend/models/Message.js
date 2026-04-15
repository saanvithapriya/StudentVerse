const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    // threadId = sorted pair of user IDs (ensures consistent grouping)
    threadId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Index for fast conversation lookup
messageSchema.index({ threadId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
