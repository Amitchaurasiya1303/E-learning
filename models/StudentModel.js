const mongoose = require('mongoose');
const secure = require('../controller/Securities/secure')

const StudentSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name:
    {
        type: String
    },
    dob: {
        type: Date,
        required: [true, 'Please Select Your DOB']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Gender Must Be Define']
    },
    role: {
        type: String,
        default: 'student'
    },
    profile_pic:{
        type:String,
    },
    email_id: {
        type: String,
        required: [true, 'Please Enter Your Valid Email Id'],
        unique: true
    },
    phone_number: {
        type: Number,
        required: [true, 'Please Enter Your Phone Number']
    },
    user_name: {
        type: String,
        required: [true, 'Please Enter Your Valid Email Id'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password Must Conatains 8 Character']
    },
    confirm_password: {
        type: String,
        required: [true, 'Please Confirm Your Password']
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    zip: {
        type: Number
    },
    passwordChangedAt: Date
})

StudentSchema.pre('save', async function (next) {
    try {
        const encryptedPassword = await secure.bcryptPassword(this.password);
        this.password = encryptedPassword;
        this.confirm_password = undefined;
        next();
    } catch (error) {
        next(error);
    }
});

StudentSchema.methods.isPasswordChanged = async function (JWtTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWtTimeStamp < passwordChangedTimeStamp;
    }
    return false;
}

const Student = mongoose.model('students', StudentSchema);
module.exports = Student;