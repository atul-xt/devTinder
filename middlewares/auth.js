const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');


const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            return res.status(401).json({ message: "Please try to again login" });
        }
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(_id);

        if (!user) {
            throw new Error("User not exist");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    userAuth
}
