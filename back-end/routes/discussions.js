const express = require('express');
const router = express.Router();
const Thread = require('../models/Discussion');
const Course = require('../models/Course');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Get all threads for a course
router.get('/course/:courseId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const threads = await Thread.find({ course: req.params.courseId })
            .sort({ isPinned: -1, lastActivity: -1 });
        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific thread
router.get('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        // Increment view count
        thread.views += 1;
        await thread.save();

        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new thread
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const course = await Course.findById(req.body.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const isEnrolled = course.enrolledStudents.some(
            student => student.studentId === req.auth.userId
        );
        if (!isEnrolled && course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        const thread = new Thread({
            ...req.body,
            author: req.auth.userId
        });
        const newThread = await thread.save();
        res.status(201).json(newThread);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a thread
router.put('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.author !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to update this thread' });
        }

        Object.assign(thread, req.body);
        const updatedThread = await thread.save();
        res.json(updatedThread);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a thread
router.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.author !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this thread' });
        }

        await thread.remove();
        res.json({ message: 'Thread deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a reply to a thread
router.post('/:id/replies', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.isLocked) {
            return res.status(400).json({ message: 'Thread is locked' });
        }

        const course = await Course.findById(thread.course);
        const isEnrolled = course.enrolledStudents.some(
            student => student.studentId === req.auth.userId
        );
        if (!isEnrolled && course.instructor !== req.auth.userId) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        thread.replies.push({
            author: req.auth.userId,
            content: req.body.content,
            attachments: req.body.attachments || []
        });

        await thread.save();
        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a reply
router.put('/:threadId/replies/:replyId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        const reply = thread.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        if (reply.author !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to update this reply' });
        }

        Object.assign(reply, req.body);
        await thread.save();
        res.json(thread);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a reply
router.delete('/:threadId/replies/:replyId', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        const reply = thread.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        if (reply.author !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this reply' });
        }

        reply.remove();
        await thread.save();
        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a reaction to a reply
router.post('/:threadId/replies/:replyId/reactions', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        const reply = thread.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        const existingReaction = reply.reactions.find(
            r => r.user === req.auth.userId && r.type === req.body.type
        );

        if (existingReaction) {
            reply.reactions = reply.reactions.filter(
                r => !(r.user === req.auth.userId && r.type === req.body.type)
            );
        } else {
            reply.reactions.push({
                user: req.auth.userId,
                type: req.body.type
            });
        }

        await thread.save();
        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark a reply as accepted answer
router.post('/:threadId/replies/:replyId/accept', ClerkExpressRequireAuth(), async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        if (thread.author !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized to accept answers' });
        }

        const reply = thread.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        // Unaccept any previously accepted answer
        thread.replies.forEach(r => {
            r.isAcceptedAnswer = false;
        });

        reply.isAcceptedAnswer = true;
        await thread.save();
        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 