const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: true,
}));

app.use(cookieParser());
const port = process.env.PORT || 8888;
const dbConnect = require('./config/dbConnect');
const initRoutes = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();

initRoutes(app);

app.use('/', (req, res) => {
    res.send('SERVER ON!')
});

app.listen(port, () => {
    console.log('Server is running on port: ' + port);
});

