const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['product_approved', 'product_rejected', 'new_answer', 'note_approved', 'new_message', 'new_review', 'item_resolved'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },   // frontend route to navigate to
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Helper static method to create notifications easily
notificationSchema.statics.create_for = async function(recipientId, type, title, message, link = '') {
    try {
        await this.create({ recipient: recipientId, type, title, message, link });
    } catch (e) {
        console.error('Failed to create notification:', e.message);
    }
};

module.exports = mongoose.model('Notification', notificationSchema);
