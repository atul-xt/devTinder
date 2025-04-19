const validator = require('validator');

const signupValidation = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName) {
        throw new Error("firstName is required");
    } else if (!(firstName.length >= 3 && firstName.length <= 12)) {
        throw new Error("firstName should be in 3 to 12 characters")
    } else if (!lastName) {
        throw new Error("lastName is required")
    } else if (!(lastName.length >= 3 && lastName.length <= 12)) {
        throw new Error("lastName should be in 3 to 12 characters")
    } else if (!emailId) {
        throw new Error("emailId is required");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    } else if (!password) {
        throw new Error("password is required");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Strong password is required (A-Z, a-z, 1-9, special character) must 8 digit");
    }
}

const loginValidation = (req) => {
    const { emailId, password } = req.body;

    if(!emailId) {
        throw new Error("emailId is required");
    } else if(!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    } else if (!password) {
        throw new Error("password is required");
    }
}

const profileEditValidation = (req) => {
    const {firstName, lastName, age, gender, profileUrl, about, skills} = req.body;

    if (!(firstName.length >= 3 && firstName.length <= 12)) {
        throw new Error("firstName should be in 3 to 12 characters")
    } else if (!(lastName.length >= 3 && lastName.length <= 12)) {
        throw new Error("lastName should be in 3 to 12 characters")
    } else if (!(age >= 10 && age <= 80)) {
        throw new Error("Age should be in 10 to 80");
    } 
}

module.exports = {
    signupValidation,
    loginValidation
}