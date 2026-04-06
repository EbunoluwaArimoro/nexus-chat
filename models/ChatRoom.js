const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "Professional collaboration space." },
    logo: { type: String, default: "💬" }, 
    category: { type: String, default: "General" }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);