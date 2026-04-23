const Message = require("../models/message.model");
const Group = require("../models/group.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const sendMessage = catchAsync(async (req, res, next) => {
    const { groupId } = req.params;
    const { content } = req.body;
    
    const group = await Group.findById(groupId);

    if(!group) {
        return next(new AppError("Group cant be found!", 404));
    }

    if(!group.members.includes(req.user._id)){
        return next(new AppError("You cant send message in this group, you are not member!", 401));
    }

    let message = await Message.create({sender: req.user._id, group: group._id, content});

    message = await message.populate("sender");

    // Emit to room members (toObject ensures clean serialization for Socket.IO)
    req.io.to(groupId).emit("newMessage", message.toObject());

    res.status(201).json({
        status: "success",
        message: "Succesfully created message!",
        data: {
            message
        }
    });
});

const deleteMessage = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if(!message) {
        return next(new AppError("Message cant be found to delete!", 404));
    }

    if(message.sender.toString() != req.user._id.toString()){
        return next(new AppError("You cant delete this message!", 401));
    }

    await Message.findByIdAndDelete(messageId);

    req.io.to(message.group.toString()).emit("deleteMessage", messageId);

    res.status(203).json({
        status: "success",
        message: "Message succesfully deleted!"
    })
});

const getMessagesByGroup = catchAsync(async (req, res, next) => {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if(!group) {
        return next(new AppError("Group cant be found!", 404));
    }

    if(!group.members.includes(req.user._id)){
        return next(new AppError("You cant send message in this group, you are not member!", 401));
    }

    const messages = await Message.find({group: group._id}).populate("sender");

    res.status(201).json({
        status: "success",
        message: "Succesfully returned messages!",
        data: {
            messages
        }
    });
});

module.exports = { sendMessage, deleteMessage, getMessagesByGroup };