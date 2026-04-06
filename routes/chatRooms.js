const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const verifyToken = require('../middleware/authMiddleware');

// 1. Get all available rooms
router.get('/', verifyToken, async (req, res) => {
    try {
        const rooms = await ChatRoom.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch rooms" });
    }
});

// 2. Create a new room
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newRoom = new ChatRoom({
            name,
            description,
            createdBy: req.user.id
        });
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ error: "Error creating room. Name might be taken." });
    }
});

// 3. Get a single room's details by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.id);
        if (!room) return res.status(404).json({ error: "Room not found" });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching room details" });
    }
});

module.exports = router;