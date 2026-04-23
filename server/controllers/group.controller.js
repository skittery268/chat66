const Group = require("../models/group.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const createGroup = catchAsync(async (req, res, next) => {
    const { title } = req.body;

    const group = await Group.create({
        title,
        members: [req.user._id],
        admin: req.user._id
    });

    res.status(201).json({
        status: 'success',
        message: 'Group created succesfully!',
        data: {
            group
        }
    })
});

const deleteGroup = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const group = await Group.findById(id);

    if(!group) {
        return next(new AppError("Group cant be found!", 404));
    }

    if(group.admin.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not admin of this group!", 401));
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({
        status: 'success',
        message: 'Group deleted succesfully!',
    })
});

const getUserGroups = catchAsync(async (req, res, next) => {
    const groups = await Group.find({members: req.user._id});

    res.status(200).json({
        status: 'success',
        message: 'succesfully returned groups!',
        data: {
            groups
        }
    })
});

const joinGroup = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const group = await Group.findById(id);

    if(!group) {
        return next(new AppError("Group cant be found!", 404));
    }

    if(group.members.includes(req.user._id)) {
        return next(new AppError("You are in group!", 400));
    }

    group.members.push(req.user._id);

    await group.save();

    res.status(201).json({
        status: 'success',
        message: 'You succesfully joined Group!',
        data: {
            group
        }
    })
});


module.exports = { createGroup, getUserGroups, deleteGroup, joinGroup };
