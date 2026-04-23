const express = require('express');
const { signup, login, getMe } = require('../controllers/auth.controller');
const protect = require('../middlewares/protect.middleware');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);

module.exports = authRouter;