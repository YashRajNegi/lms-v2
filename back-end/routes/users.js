const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
    try {
        const {
            clerkId,
            email,
            role,
            firstName,
            lastName
        } = req.body;

        // Check if user already exists by email or clerkId
        const existingUser = await User.findOne({
            $or: [{
                email: email
            }, {
                clerkId: clerkId
            }]
        });
        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or clerkId already exists'
            });
        }

        const newUser = new User({
            clerkId,
            email,
            role,
            firstName,
            lastName
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            error: 'Server error, please try again later.'
        });
    }
});

// GET /api/users/:clerkId - Get a user by Clerk ID

router.get('/:clerkId', async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by Clerk ID:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// A more secure alternative: GET /api/users/me - Get the authenticated user's details
router.get('/me', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId; // Get the authenticated user's Clerk ID
        if (!userId) {
             return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            // This case ideally shouldn't happen if webhook created the user, but handle it
            return res.status(404).json({ error: 'User not found in DB' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching authenticated user:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

module.exports = router; 