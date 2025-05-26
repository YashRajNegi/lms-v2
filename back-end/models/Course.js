const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: {
            type: String,
            enum: ['text', 'video', 'quiz', 'assignment', 'mixed'],
            required: true
        },
        text: {
            content: String,
            format: {
                type: String,
                enum: ['markdown', 'html', 'plain'],
                default: 'markdown'
            }
        },
        video: {
            url: String,
            duration: Number,
            provider: {
                type: String,
                enum: ['youtube', 'vimeo', 'custom'],
                default: 'youtube'
            }
        },
        quiz: {
            questions: [{
                question: String,
                type: {
                    type: String,
                    enum: ['multiple_choice', 'true_false', 'short_answer'],
                    required: true
                },
                options: [String],
                correctAnswer: mongoose.Schema.Types.Mixed,
                explanation: String,
                points: {
                    type: Number,
                    default: 1
                }
            }],
            passingScore: Number,
            timeLimit: Number
        }
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    order: {
        type: Number,
        required: true
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

const enrolledStudentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date,
        default: null
    }
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String, // Store the URL of the course image
        required: false // Image is not strictly required initially
    },
    instructor: {
        type: String,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    lessons: [lessonSchema],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    enrolledStudents: [enrolledStudentSchema],
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    tags: [String],
    // AI-related fields
    aiMetadata: {
        difficultyScore: Number,
        topicVector: [Number],
        recommendedFor: [{
            learningStyle: String,
            confidence: Number
        }],
        contentAnalysis: {
            complexity: Number,
            estimatedTimeToComplete: Number,
            keyConcepts: [String]
        }
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
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
courseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating before saving
courseSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
    }
    next();
});

module.exports = mongoose.model('Course', courseSchema); 