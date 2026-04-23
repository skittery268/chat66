const express = require('express');
const protect = require('../middlewares/protect.middleware');
const { createGroup, deleteGroup, joinGroup, getUserGroups } = require('../controllers/group.controller');

const groupRouter = express.Router();

groupRouter.post('/', protect, createGroup);
groupRouter.get('/user', protect, getUserGroups);
groupRouter.delete('/:id', protect, deleteGroup);
groupRouter.post('/join/:id', protect, joinGroup);

module.exports = groupRouter;