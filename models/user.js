const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        validate(value) {
            if (!value) {
                throw new Error("firstName is required");
            } else if (!(value.length >= 3 && value.length <= 12)) {
                throw new Error("firstName should be in 3 to 12 characters")
            }
        }
    },
    lastName: {
        type: String,
        validate(value) {
            if (!value) {
                throw new Error("lastName is required")
            } else if (!(value.length >= 3 && value.length <= 12)) {
                throw new Error("lastName should be in 3 to 12 characters")
            }
        }
    },
    emailId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!value) {
                throw new Error("emailId is required");
            } else if (!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Strong password is required (A-Z, a-z, 1-9, special character) must 8 digit");
            }
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value && !(value >= 10 && value <= 80)) {
                throw new Error("Age should be in 10 to 80");
            }
        }
    },
    gender: {
        type: String,
        validate(value) {
            if (value && !["male", "female", "others"].includes(value)) {
                throw new Error("Invalid gender provided.")
            }
        }
    },
    profileUrl: {
        type: String,
        default: "https://imgs.search.brave.com/2x3imi_133lqnirJKZE69J-WlAJ93mKjrrYoyzNw40g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMtY3NlLmNhbnZh/LmNvbS9ibG9iLzE5/NDA4MzAvMTYwMHct/cWdDbmQ1c3djclEu/anBn",
        validate(value) {
            if (value && !validator.isURL(value)) {
                throw new Error("Invalid photoUrl address");
            }
        }
    },
    about: {
        type: String,
        validate(value) {
            if (value && value.length > 200) {
                throw new Error("About should be under 200 words")
            }
        }
    },
    skills: {
        type: [String],
        validate(value) {
            if (value && value.length > 10) {
                throw new Error("Skills should be under 10")
            }
        }
    }

}, { timestamps: true })

userSchema.methods.getJWT = function () {
    try {
        const token = jwt.sign({ _id: this._id }, "DEV@TINDER$2885", { expiresIn: '1d' });
        return token;
    } catch (error) {
        throw new Error("Error while getting jwt token");
    }
}

userSchema.methods.checkBcryptPassword = async function (password) {
    try {
        const isPasswordValid = await bcrypt.compare(password, this.password);
        return isPasswordValid
    } catch (error) {
        throw new Error("Error while checking password");
    }
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  

const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;