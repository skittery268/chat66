const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required!"]
    },
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],
    public: {
        type: Boolean,
        default: true
    },
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;