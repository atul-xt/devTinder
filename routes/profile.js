const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { isGettingData, isUpdateAllowed, updationAllowed } = require('../utils/helper');
const UserModel = require('../models/user');

const profileRouter = express.Router({ caseSensitive: true });

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

// profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
//     try {
//         const data = req.body;
//         const { _id } = req.user;
//         updationAllowed(req);

//         const updatedUser = await User.findByIdAndUpdate(_id, data, { returnDocument: 'after', runValidators: true });
//         if (!updatedUser) {
//             throw new Error("User not found")
//         }
//         res.status(200).json({ message: `${req.user.firstName}, your edit is successful.`, data: updatedUser });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// })

// profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
//     try {
//         const newData = req.body;
//         updationAllowed(req);

//         const loggedInUser = req.user;
//         Object.keys(newData).forEach((key) => loggedInUser[key] = newData[key]);

//         if (!loggedInUser) throw new Error("user not found");
//         await loggedInUser.save();
//         res.send(loggedInUser)
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// })

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const updates = req.body;
        const user = req.user;

        updationAllowed(req);

        Object.entries(updates).forEach(([key, value]) => user[key] = value);

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully.",
            data: user
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        if (!currentPassword || !newPassword) {
            throw new Error("Please provide currentPassword and newPassword");
        }

        const isPasswordValid = await UserModel.checkBcryptPassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Current password is not valid." });
        }

        const bcryptPass = await user.getBcryptPassword(newPassword);
        user.password = bcryptPass;

        await user.save();
        res.status(200).json({ message: "Password is successfully changed" });

    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
})

module.exports = profileRouter;