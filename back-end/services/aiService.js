const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Course Recommendation
    async getCourseRecommendations(user, availableCourses) {
        try {
            const prompt = `Based on the following user profile and available courses, recommend the top 5 most suitable courses:
                User Profile:
                - Learning Style: ${user.preferences.learningStyle}
                - Current Level: ${user.preferences.difficultyLevel}
                - Topics of Interest: ${user.preferences.topics.join(', ')}
                - Completed Courses: ${user.enrolledCourses.length}
                
                Available Courses:
                ${availableCourses.map(course => `
                    - ${course.title}
                    - Level: ${course.level}
                    - Category: ${course.category}
                    - Tags: ${course.tags.join(', ')}
                `).join('\n')}
                
                Provide recommendations in JSON format with the following structure:
                {
                    "recommendations": [
                        {
                            "courseId": "string",
                            "confidence": number,
                            "reason": "string"
                        }
                    ]
                }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error in course recommendations:', error);
            throw error;
        }
    }

    // Content Analysis
    async analyzeContent(content, type = 'text') {
        try {
            const prompt = `Analyze the following ${type} content and provide insights:
                Content: ${content}
                
                Provide analysis in JSON format with the following structure:
                {
                    "complexity": number,
                    "estimatedTimeToComplete": number,
                    "keyConcepts": ["string"],
                    "prerequisites": ["string"],
                    "relatedTopics": ["string"],
                    "difficultyScore": number
                }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error in content analysis:', error);
            throw error;
        }
    }

    // Automated Grading
    async gradeAssignment(submission, rubric) {
        try {
            const prompt = `Grade the following assignment submission based on the provided rubric:
                Submission: ${JSON.stringify(submission.content)}
                
                Rubric:
                ${rubric.map(criterion => `
                    - ${criterion.criterion}
                    - Description: ${criterion.description}
                    - Points: ${criterion.points}
                    - Weight: ${criterion.weight}
                `).join('\n')}
                
                Provide grading in JSON format with the following structure:
                {
                    "score": number,
                    "confidence": number,
                    "feedback": "string",
                    "rubricScores": [
                        {
                            "criterion": "string",
                            "score": number,
                            "feedback": "string"
                        }
                    ]
                }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error in automated grading:', error);
            throw error;
        }
    }

    // Learning Path Optimization
    async optimizeLearningPath(user, currentCourse) {
        try {
            const prompt = `Based on the user's progress and current course, suggest an optimized learning path:
                User Profile:
                - Learning Style: ${user.preferences.learningStyle}
                - Current Level: ${user.preferences.difficultyLevel}
                - Completed Courses: ${user.enrolledCourses.length}
                - Current Course: ${currentCourse.title}
                
                Provide optimization suggestions in JSON format with the following structure:
                {
                    "suggestedOrder": ["lessonId"],
                    "estimatedCompletionTime": number,
                    "recommendedFocus": ["string"],
                    "potentialChallenges": ["string"],
                    "optimizationStrategy": "string"
                }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error in learning path optimization:', error);
            throw error;
        }
    }

    // Plagiarism Detection
    async checkPlagiarism(content, type = 'text') {
        try {
            const prompt = `Analyze the following ${type} content for potential plagiarism:
                Content: ${content}
                
                Provide analysis in JSON format with the following structure:
                {
                    "plagiarismScore": number,
                    "suspiciousSections": [
                        {
                            "text": "string",
                            "confidence": number,
                            "suggestion": "string"
                        }
                    ],
                    "originalityScore": number
                }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error in plagiarism detection:', error);
            throw error;
        }
    }
}

module.exports = new AIService(); 