const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const UserModel = require("../models/user");
const multer = require("multer");
const userRouter = express.Router();
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const USER_SAVE_DATA = [
  "firstName",
  "lastName",
  "profileUrl",
  "about",
  "skills",
  "gender",
  "age",
];
const upload = multer({ dest: "uploads/" });
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    limit = limit >= 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    const connections = await ConnectionRequestModel.find({
      $or: [{ toUserId: _id }, { fromUserId: _id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connections.forEach(({ fromUserId, toUserId }) => {
      hideUsersFromFeed.add(fromUserId.toString());
      hideUsersFromFeed.add(toUserId.toString());
    });

    const allUsers = await UserModel.find(
      {
        _id: {
          $nin: [...hideUsersFromFeed, _id], // exclude already connected and self
        },
      },
      USER_SAVE_DATA
    );

    const paginatedUsers = allUsers.slice(skip, skip + limit);

    res.status(200).json({
      message: "Feed data successfully fetched",
      allUser: paginatedUsers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;

    const requestData = await ConnectionRequestModel.find({
      toUserId: _id,
      status: "interested",
    }).populate("fromUserId", USER_SAVE_DATA);

    if (!requestData || requestData.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    res
      .status(200)
      .json({ message: "Requests fetched successfully", requestData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;
    const connections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: _id, status: "accepted" },
        { fromUserId: _id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAVE_DATA)
      .populate("toUserId", USER_SAVE_DATA);

    if (!connections || connections.length === 0) {
      return res.status(404).json({ message: "No connections found." });
    }

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === _id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res
      .status(200)
      .json({ message: "Connections fetched successfully.", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.patch(
  "/upload-profile",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = req.body.id; // Taking user ID from request parameters
      const filePath = req.file.path;

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "profile_photos",
      });
      // Update user's profileImage field
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { profileUrl: result.display_name + "." + result.format },
        { new: true }
      );

      // Delete the local file after upload
      fs.unlinkSync(filePath);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res
        .status(200)
        .json({ message: "Profile photo updated successfully", user });
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "Failed to update profile photo" });
    }
  }
); // Update profile photo

module.exports = userRouter;
