const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        'mongodb+srv://atul-xt:atul2885@namastenodejs.ojg4sky.mongodb.net/devTinder'
    );
};

module.exports = connectDB;