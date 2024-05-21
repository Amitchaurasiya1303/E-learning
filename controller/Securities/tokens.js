const jwt = require('jsonwebtoken');

//==================== To Get The Token ===================
exports.getToken = (id) => jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES_IN
});
