const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing the user's ID.
 * Token expiration is controlled by the JWT_EXPIRES env variable.
 */
const signToken = (user) => {
    return jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

/**
 * Creates a JWT for the given user, sets it as an HTTP-only cookie,
 * and sends a JSON success response.
 * - In dev mode: cookie is non-secure with SameSite=None (for cross-origin dev tools).
 * - In production: cookie is secure with SameSite=Strict.
 * - Password is stripped from the user object before sending the response.
 */
const createSendToken = catchAsync(async (user, res, statusCode) => {
    const token = signToken(user);

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'dev' ? false : true,
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        sameSite: process.env.NODE_ENV == 'dev' ? 'Lax' : 'None'
    });

    // Remove password from the output for security
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        message: 'Succesfully logged in!',
        data: {
            user
        }
    });
});

/**
 * Registers a new user with fullname, email, and password.
 * Does not auto-login — returns a 201 success message only.
 */
const signup = catchAsync(async (req, res) => {
    const { fullname, email, password } = req.body;

    await User.create({fullname, email, password});

    res.status(201).json({
        status: 'success',
        message: 'User created succesfully!'
    });
});

/**
 * Authenticates a user by email and password.
 * On success, issues a JWT cookie via createSendToken.
 * Returns a 400 error if credentials don't match.
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({email, password}).select("+password");

    if(!user) {
        return next(new AppError("User credentials is incorrect!", 400));
    }

    createSendToken(user, res, 200);
});

/**
 * Returns the currently authenticated user based on the JWT cookie.
 * Used for auto-login on page refresh.
 */
const getMe = catchAsync(async (req, res) => {
    req.user.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
});

module.exports = { signup, login, getMe }