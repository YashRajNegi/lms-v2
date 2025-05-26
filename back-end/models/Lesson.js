const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
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
    order: {
        type: Number,
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
    // AI-related fields
    aiAnalysis: {
        complexity: Number,
        estimatedTimeToComplete: Number,
        keyConcepts: [String],
        prerequisites: [String],
        relatedTopics: [String],
        difficultyScore: Number
    },
    resources: [{
        title: String,
        type: {
            type: String,
            enum: ['document', 'link', 'file'],
            required: true
        },
        url: String,
        description: String
    }],
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
lessonSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Lesson', lessonSchema); 