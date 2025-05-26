const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const { Webhook } = require('svix'); // Import Webhook from svix
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET; // Make sure you have this env var set

// Middleware to get the raw body for webhook signature verification
// Apply this middleware ONLY to the webhook route to avoid interfering with other routes
router.use(express.json({
    limit: '5mb', // Adjust limit as needed
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// POST /api/webhook - Receive Clerk webhooks
router.post('/', async (req, res) => {
    // Use req.rawBody for signature verification
    const payloadString = req.rawBody;
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ error: "Error: No Svix headers" });
    }

    // Create a new Webhook instance with your secret
    const wh = new Webhook(webhookSecret);

    let msg;
    try {
        // Verify the payload
        msg = wh.verify(payloadString, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        });
    } catch (err) {
        // If verification fails, error out
        console.error('Error verifying webhook signature:', err.message);
        return res.status(400).json({ error: 'Error: Invalid signature' });
    }

    // Get the ID and type from the verified event object
    const { id, type, data } = msg;

    console.log(`Clerk Webhook Received: Event Type ${type} ID ${id}`);

    // Handle the webhook event
    try {
        switch (type) {
            case 'user.created':
                const clerkUser = data; // Use data from the verified event
                console.log(`Processing user.created event for Clerk user ID: ${clerkUser.id}`);

                // Check if user already exists to avoid duplicates
                const existingUser = await User.findOne({ clerkId: clerkUser.id });
                if (existingUser) {
                    console.log(`User with clerkId ${clerkUser.id} already exists in DB.`);
                    return res.status(200).json({ success: true, message: 'User already exists.' });
                }

                const newUser = new User({
                    clerkId: clerkUser.id,
                    email: clerkUser.email_addresses?.[0]?.email_address, // Assuming primary email is the first
                    firstName: clerkUser.first_name,
                    lastName: clerkUser.last_name,
                    // Assign a default role, you might want more complex logic here
                    role: 'student'
                });
                await newUser.save();
                console.log(`User ${newUser.clerkId} created in DB.`);
                break;
            case 'user.updated':
                const updatedClerkUser = data; // Use data from the verified event
                console.log(`Processing user.updated event for Clerk user ID: ${updatedClerkUser.id}`);
                await User.findOneAndUpdate(
                    { clerkId: updatedClerkUser.id },
                    {
                        email: updatedClerkUser.email_addresses?.[0]?.email_address,
                        firstName: updatedClerkUser.first_name,
                        lastName: updatedClerkUser.last_name,
                        // You might update other fields here if needed
                    },
                    { new: true, upsert: true } // upsert: create if not found
                );
                console.log(`User with clerkId ${updatedClerkUser.id} updated in DB.`);
                break;
            case 'user.deleted':
                const deletedUserData = data; // Use data from the verified event
                console.log(`Processing user.deleted event for Clerk user ID: ${deletedUserData.id}`);
                await User.deleteOne({ clerkId: deletedUserData.id });
                console.log(`User with clerkId ${deletedUserData.id} deleted from DB.`);
                break;
            // Add cases for other event types if needed
            default:
                console.warn(`Unhandled webhook event type: ${type}`);
        }

        // Respond to Clerk to acknowledge receipt
        res.status(200).json({ success: true, message: 'Webhook received and processed' });

    } catch (dbError) {
        console.error('Database error handling webhook:', dbError);
        res.status(500).json({ error: 'Database error handling webhook' });
    }
});

module.exports = router; 