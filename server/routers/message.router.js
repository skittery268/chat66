const express = require('express');
const protect = require('../middlewares/protect.middleware');
const { sendMessage, deleteMessage, getMessagesByGroup } = require('../controllers/message.controller');

const messageRouter = express.Router();

messageRouter.post('/:groupId', protect, sendMessage);
messageRouter.delete('/:messageId', protect, deleteMessage);
// Get messages by group id
messageRouter.get('/group/:groupId', protect, getMessagesByGroup);

module.exports = messageRouter;