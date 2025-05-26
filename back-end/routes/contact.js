const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Import the Contact model

// POST /api/contact - Handle Contact Form Submission
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        
        // Sending a color hint in the response
        res.status(201).json({ 
            message: "Thank you, we will contact you soon", 
            color: "green" 
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Server error, please try again later.", 
            color: "red" 
        });
    }
});

module.exports = router; 