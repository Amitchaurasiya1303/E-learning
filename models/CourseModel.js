const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    course_title: {
        type: String,
        required: true
    },
    instructor_id: {
        type: mongoose.Schema.ObjectId,
    },
    course_category: {
        type: String,
        enum: ['Art', 'Programming', 'Communication', 'Photography', 'Videography', 'Marketing', 'Content Writing', 'Finance', 'Science', 'Network'],
        required: true
    },
    course_language: {
        type: String,
        enum: ['Hindi', 'English']
    },
    course_img: {
        type: String,
    },
    course_description: {
        type: String,
        required: true
    },
    course_objective: {
        type: String,
        required: true
    },
    course_fee: {
        type: Number,
        required: true
    },
    course_duration: {
        type: String,
        required: true
    },course_topics: {
        type: [String],
        required: true
    },
    course_tutor: {
        type: String,
    },future_scope:{
        type: String
    }
});

const Courses = mongoose.model('courses', CourseSchema);
module.exports = Courses;