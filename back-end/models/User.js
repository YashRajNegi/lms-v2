const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'instructor'],
        default: 'student'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    teachingCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    progress: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        completedLessons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }],
        assignments: [{
            assignment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Assignment'
            },
            status: {
                type: String,
                enum: ['not_started', 'in_progress', 'submitted', 'graded'],
                default: 'not_started'
            },
            grade: Number,
            feedback: String
        }]
    }],
    preferences: {
        learningStyle: String,
        difficultyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        topics: [String]
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
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema); 