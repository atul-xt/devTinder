const User = require("../models/user");


const isEmailAlreadyRegistered = async (req) => {
    const { emailId } = req.body;

    const userExist = await User.findOne({ emailId });

    if (userExist) {
        throw new Error("User already registered");
    }
}

const updationAllowed = (req) => {
    const data = req.body;
    const updateAllowed = ["firstName", "lastName", "age", "gender", "profileUrl", "about", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) => updateAllowed.includes(k));
    
    if (!isUpdateAllowed) {
        throw new Error("Update not allowed");
    }
}

const isGettingData = (req) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Data not found");
    }
}

module.exports = {
    isEmailAlreadyRegistered,
    isGettingData,
    updationAllowed
}