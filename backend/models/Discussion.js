const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    likes: { type: Number, default: 0 }
}, { timestamps: true });

const answerSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [replySchema]
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    answers: [answerSchema]
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
