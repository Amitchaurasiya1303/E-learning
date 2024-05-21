const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const Student = require('../../models/StudentModel');


//==================== For Bcrypt Password ===================
exports.bcryptPassword = (password) => {
    return bcrypt.hash(password, 12);
}

//==================== For Compare Password ===================
exports.comparePasswords = (password, DB_password) => {
    return bcrypt.compare(password, DB_password);
}
