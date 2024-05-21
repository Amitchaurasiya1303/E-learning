const mongoose = require('mongoose');
const { bcryptPassword } = require('../controller/Securities/secure');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    email_id: {
        type: String,
        require: true,
    },
    user_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    confirm_password: {
        type: String,
        required: true
    }
})

AdminSchema.pre('save', async function (next) {
    try {
        const encryptedPassword = await bcryptPassword(this.password);
        this.password = encryptedPassword;
        this.confirm_password = undefined;
        next();
    }
    catch (error) {
        next(error);
    }
});

AdminSchema.methods.isPasswordChanged = async function (JWtTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWtTimeStamp < passwordChangedTimeStamp;
    }
    return false;
}

const Admin = mongoose.model('Admins', AdminSchema);
module.exports = Admin;
