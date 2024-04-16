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

//trích xuất dữ liệu JSON từ request body và 
//chuyển đổi thành đối tượng JavaScript
app.use(express.json());
//chuyển đổi cookies thành đối tượng JavaScript
app.use(CookieParser());

//middleware này sẽ tìm file tương ứng trong thư mục 
//uploads và gửi response cho client
app.use('/uploads', express.static(__dirname + '/uploads'));
//passMongodb: Oe9Q6isfBxpws8GP

//cho phép các yêu cầu AJAX từ http://localhost:5173 
//truy cập tài nguyên trên máy chủ 
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',

}));

//kết nối ứng dụng Node.js với cơ sở dữ liệu MongoDB 
mongoose.connect(process.env.MONGO_URL);

app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const {
        title, address, addedPhotos, description, price,
        perks, extraInfo, checkIn, checkOut, maxGuests,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id, price,
            title, address, photos: addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests,
        });
        res.json(placeDoc);
    });
});