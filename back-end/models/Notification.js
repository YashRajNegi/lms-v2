const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String, // Or mongoose.Schema.Types.ObjectId if linking to a User model
        required: true,
        index: true // Index for faster lookup by user
    },
    type: {
        type: String,
        enum: ['new_reply', 'new_assignment', 'assignment_graded', 'discussion_mention', /* add other types */],
        required: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId, // ID of the related item (e.g., discussion thread, assignment)
        required: true,
        index: true
    },
    sourceType: {
        type: String,
        enum: ['Discussion', 'Assignment', /* add other source types */],
        required: true
    },
    message: {
        type: String, // Optional: a custom message for the notification
    },
     link: {
        type: String, // Optional: a link to the related item
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting by time
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 