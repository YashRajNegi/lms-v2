const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: {
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
    submittedAt: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: String,
    status: {
        type: String,
        enum: ['submitted', 'graded', 'returned'],
        default: 'submitted'
    }
});

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    type: {
        type: String,
        enum: ['essay', 'coding', 'quiz', 'project', 'other'],
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    totalPoints: {
        type: Number,
        required: true,
        default: 100
    },
    attachments: [{
        filename: String,
        url: String,
        type: String
    }],
    submissions: [submissionSchema],
    rubric: [{
        criterion: String,
        description: String,
        points: Number,
        weight: Number
    }],
    // AI-related fields
    aiSettings: {
        autoGrade: {
            type: Boolean,
            default: false
        },
        plagiarismCheck: {
            type: Boolean,
            default: true
        },
        gradingModel: {
            type: String,
            enum: ['basic', 'advanced', 'custom'],
            default: 'basic'
        },
        customInstructions: String
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
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

// Update the updatedAt timestamp before saving
assignmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Assignment', assignmentSchema); 