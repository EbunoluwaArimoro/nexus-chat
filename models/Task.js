const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);