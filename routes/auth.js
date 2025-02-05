const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create new user
        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: req.body.password
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        // Find user by username
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Create user session data
        const userData = {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        };

        res.json({
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile Route
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            createdon: user.createdon
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile Route
router.put('/profile/update', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user fields
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        if (req.body.password) {
            user.password = req.body.password; // Will be hashed by pre-save hook
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout Route (if needed for session cleanup)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;