const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const connectionRequestRouter = require('./routes/requestConnection');
const userRouter = require('./routes/user');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173', 'https://dev-tinder-web-gamma.vercel.app', 'http://16.171.232.113'];

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