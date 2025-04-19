const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const { userAuth } = require('./middlewares/auth');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const connectionRequestRouter = require('./routes/requestConnection');
const userRouter = require('./routes/user');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173', 'https://dev-tinder-web-gamma.vercel.app/'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', connectionRequestRouter);
app.use('/', userRouter);

app.delete('/user/:userId', userAuth, async (req, res) => {
    try {
        const id = req.params?.userId;

        const isAlreadyDeleted = await User.findById(id);
        if (!isAlreadyDeleted) {
            return res.status(400).json({ message: "User not found or already deleted" });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.get('/feed', userAuth, async (req, res) => {
    try {
        const feedData = await User.find({});
        if (feedData.length === 0) {
            return res.status(200).json({ message: "No users found", data: [] })
        }
        res.status(200).json({ data: feedData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

connectDB()
    .then(() => {
        console.log("DB successfully connected...");
        app.listen(3000, () => {
            console.log("Server is running on the PORT NUM: 3000");
        })
    })
    .catch((err) => {
        console.log("ERROR: ", err);
    })