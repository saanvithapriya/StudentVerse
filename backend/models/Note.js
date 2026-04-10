const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploaderName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
