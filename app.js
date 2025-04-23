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

const allowedOrigins = ['http://localhost:5173', 'https://dev-tinder-web-gamma.vercel.app', 'http://172.20.10.2:5173'];

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
        app.listen(5000, '0.0.0.0', () => {
            console.log("Server is running on the PORT NUM: 5000");
        })
    })
    .catch((err) => {
        console.log("ERROR: ", err);
    })