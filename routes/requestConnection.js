const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');

const connectionRequestRouter = express.Router();

connectionRequestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id.toString();
        const toUserId = req.params?.toUserId.toString();
        const status = req.params?.status;
        
        const existingRequest = await ConnectionRequestModel.findOne({ fromUserId, toUserId });
        if (existingRequest) {
            throw new Error("Connection request already sent.");
        }

        const data = await ConnectionRequestModel.findOne({ toUserId: fromUserId });
        if (data?.fromUserId.toString() === toUserId) {
            throw new Error("Connection request already exist");
        }

        const allowedStatus = ['interested', 'ignored'];
        if (!allowedStatus.includes(status)) {
            throw new Error(`Invalid status type ${status}`);
        }

        const newRequest = new ConnectionRequestModel({ fromUserId, toUserId, status });
        await newRequest.save();

        res.status(201).json({
            message: "Connection request successfully sent",
            newRequest
        })
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

connectionRequestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const { _id } = req.user;
        const { requestId, status } = req.params;

        const allowedStatus = ['accepted', 'rejected'];
        if (!allowedStatus.includes(status)) {
            throw new Error(`Invalid status type ${status}`);
        }

        const connectionRequest = await ConnectionRequestModel.findOne({ _id: requestId, toUserId: _id, status: 'interested' });

        if (!connectionRequest) {
            throw new Error("Connection request not found.");
        }

        connectionRequest.status = status;
        await connectionRequest.save();

        res.status(201).json({ message: "Connection request " + status, connectionRequest });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = connectionRequestRouter;