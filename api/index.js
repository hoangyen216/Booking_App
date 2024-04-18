const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CookieParser = require('cookie-parser');
require('dotenv').config();
const User = require('./models/User.js');
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

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id,
                name: userDoc.name
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });

        } else {
            res.status(422).json('pass not ok');
        }
    }
    else {
        res.json('not found');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }

});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})

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

app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Place.find({ owner: id }));

    });
});

app.get('/places', async (req, res) => {
    res.json(await Place.find());
});

app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    res.json(await Place.findById(id));
});


app.listen(4000);

