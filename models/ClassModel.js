const mongoose = require('mongoose');

const Class = new mongoose.Schema({
    c_id: {
        type: mongoose.Schema.ObjectId,
    },
    class_title: {
        type: String,
        required: true
    },
    class_desc: {
        type: String,
        required: true
    },
    class_vid: {
        type: String,
        required: true
    },
    class_notes: {
        type: String
    }
});

const ClassSchema = mongoose.model('classes', Class);
module.exports = ClassSchema;