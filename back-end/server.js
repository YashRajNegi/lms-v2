const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Middleware to parse JSON data


mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    retryWrites: true,
    w: 'majority'
})
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully");
        
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("MongoDB Atlas Connection Error:", err);
        process.exit(1); // Exit if cannot connect to database
    });

// Import routers
const courseRoutes = require('./routes/courses');
const discussionRoutes = require('./routes/discussions');
const assignmentRoutes = require('./routes/assignments');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users'); // Import user routes
const webhookRoutes = require('./routes/webhook'); // Import webhook routes
const contactRoutes = require('./routes/contact'); // Import contact routes

// Mount routers
app.use('/api/courses', courseRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/webhook', webhookRoutes); // Mount webhook routes
app.use('/api/contact', contactRoutes); // Mount contact routes

// Import models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Assignment = require('./models/Assignment');

// API Routes

// Get all courses
/*
app.get("/api/courses", async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' })
            .populate('instructor', 'firstName lastName')
            .select('-__v');
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: "Error fetching courses" });
    }
});
*/

// Get course by ID
/*
app.get("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'firstName lastName')
            .populate('lessons')
            .populate('assignments')
            .select('-__v');
        
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: "Error fetching course" });
    }
});
*/

// Create new course
/*
app.post("/api/courses", async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: "Error creating course" });
    }
});
*/

// Update course
/*
app.put("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
    }
        
        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: "Error updating course" });
    }
});
*/

// Delete course
/*
app.delete("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: "Error deleting course" });
    }
});
*/
