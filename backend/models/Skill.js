const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    type: { type: String, enum: ['offer', 'request'], required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true, default: 'Intermediate' },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
