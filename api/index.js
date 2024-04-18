const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const CookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const Booking = require('./models/Booking.js');
const multer = require('multer');
const Place = require('./models/Place');
const fs = require('fs');
require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'ajdhfhjhvdfie';

app.use(express.json());
app.use(CookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
//passMongodb: Oe9Q6isfBxpws8GP

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',

}));

mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        // trả về dữ liệu người dùng nếu xác thực token thành công
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    });
}

app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const {
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;
    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
        user: userData.id,
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        throw err;
    });
});

app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    // kết quả trả về bao gồm các phòng được đặt bởi người dùng 
    //phương thức populate trong Mongoose để nạp thêm dữ liệu từ một collection liên quan khác 
    res.json(await Booking.find({ user: userData.id }).populate('place'));
});

app.listen(4000);