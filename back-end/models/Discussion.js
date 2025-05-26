const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        filename: String,
        url: String,
        type: String
    }],
    reactions: [{
        user: String,
        type: {
            type: String,
            enum: ['like', 'helpful', 'confused']
        }
    }],
    isAcceptedAnswer: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    tags: [String],
    category: {
        type: String,
        enum: ['general', 'question', 'discussion', 'announcement'],
        default: 'general'
    },
    attachments: [{
        filename: String,
        url: String,
        type: String
    }],
    replies: [replySchema],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps before saving
threadSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.lastActivity = Date.now();
    next();
});

replySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Thread', threadSchema); 