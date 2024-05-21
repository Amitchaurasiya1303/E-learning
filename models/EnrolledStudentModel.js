const mongoose = require('mongoose');

const EnrolledStudent = new mongoose.Schema({
    s_id: {
        type: mongoose.Schema.ObjectId,
        required:true
    },
    c_id: {
        type: mongoose.Schema.ObjectId,
        required:true
    },
    payment_id:{
        type:mongoose.Schema.ObjectId,
        required:true
    },
    enrolled_date: {
        type: Date,
        default: Date.now
    }
})

const EnrolledCourses = mongoose.model('EnrolledCourses', EnrolledStudent);
module.exports = EnrolledCourses;


  