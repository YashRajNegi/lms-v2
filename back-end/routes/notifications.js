const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Assuming you have a Notification model
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node'); // Correct import

// Example route: Get notifications for the authenticated user
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId; // Get user ID from Clerk auth
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find notifications for the user, sorted by creation date
        const notifications = await Notification.find({ userId: userId })
                                                .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
});

// Example route: Mark a notification as read
router.put('/:notificationId/read', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const userId = req.auth.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, userId: userId }, // Find notification by ID and ensure it belongs to the user
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or does not belong to user' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add other notification-related routes here (e.g., delete notification)

module.exports = router; 