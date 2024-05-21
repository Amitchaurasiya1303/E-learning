const mongoose = require('mongoose');

const Contact = new mongoose.Schema({
    con_name: {
        type: String,
        required: true
    },
    con_email: {
        type: String,
        required: true
    },
    con_message: {
        type: String,
        required: true
    },
});

const ContactSchema = mongoose.model('contact', Contact);
module.exports = ContactSchema;