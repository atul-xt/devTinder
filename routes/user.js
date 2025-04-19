const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const UserModel = require('../models/user');

const userRouter = express.Router();
const USER_SAVE_DATA = ['firstName', 'lastName', 'profileUrl', 'about', 'skills', 'gender', 'age'];

userRouter.get('/user/feed', userAuth, async (req, res) => {
    try {
        const { _id } = req.user;
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        limit = limit >= 50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const connections = await ConnectionRequestModel.find({
            $or: [
                { toUserId: _id },
                { fromUserId: _id }
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();

        connections.forEach(({ fromUserId, toUserId }) => {
            hideUsersFromFeed.add(fromUserId.toString());
            hideUsersFromFeed.add(toUserId.toString());
        });

        const allUser = await UserModel.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: _id } }
            ]
        }, USER_SAVE_DATA)
            .skip(skip)
            .limit(limit);

        res.status(200).json({ message: "Feed data successfully fetched", allUser });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const { _id } = req.user;

        const requestData = await ConnectionRequestModel.find({ toUserId: _id, status: 'interested' })
            .populate('fromUserId', USER_SAVE_DATA);

        if (!requestData || requestData.length === 0) {
            throw new Error("No requests found");
        }

        res.status(200).json({ message: "Requests fetched successfully", requestData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const { _id } = req.user;

        const connections = await ConnectionRequestModel.find({
            $or: [
                { toUserId: _id, status: 'accepted' },
                { fromUserId: _id, status: 'accepted' }
            ]
        }).populate('fromUserId', USER_SAVE_DATA)
            .populate('toUserId', USER_SAVE_DATA);

        if (!connections || connections.length === 0) {
            throw new Error("No connections found.");
        }

        const data = connections.map((row) => {
            if (row.fromUserId._id.toString() === _id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        })

        res.status(200).json({ message: "Connections fetched successfully.", data });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})


module.exports = userRouter;