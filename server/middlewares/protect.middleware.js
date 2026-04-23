const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Authentication token is required!", 401));
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);

        if (!user) {
            return next(new AppError("Token is expired or invalid!", 401));
        }

        req.user = user;

        return next();
    } catch (err) {
        return next(new AppError("Token is expired or invalid!", 401));
    }
};

module.exports = protect;
