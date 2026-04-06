const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Username might exist." });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "User not found" });

        // Compare the passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 3. LOGOUT ROUTE
router.post('/logout', (req, res) => {
    // Logout is mostly handled on the frontend by deleting the token, 
    // but we provide this route as an endpoint confirmation.
    res.json({ message: "Logged out successfully" });
});

module.exports = router;