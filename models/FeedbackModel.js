const mongoose = require('mongoose');

const Feedback = new mongoose.Schema({
 s_id:{
   type:mongoose.Schema.ObjectId
 },
 f_subject:{
   type:String,
   required:true
 },
 feedback:{
    type:String,
    required:true
 },
 f_date:{
    type:Date,
    default:Date.now
 }
})

const feedbackModel = mongoose.model('feedback',Feedback);
module.exports = feedbackModel;