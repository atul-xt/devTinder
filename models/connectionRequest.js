const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['accepted', 'rejected', 'ignored', 'interested'],
            message: `{VALUE} status is not valid.`
        }
    }
}, { timestamps: true })

connectionRequestSchema.pre('save', function (next) {
    
    const { fromUserId, toUserId } = this;

    if (fromUserId.toString() === toUserId.toString()) {
        throw new Error("You cannot send request to yourself");
    }
    next();
})

const ConnectionRequestModel = mongoose.model("ConnectionRequestModel", connectionRequestSchema);

module.exports = ConnectionRequestModel;