const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'pug');
app.set('views', './views');

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/shop');
const accountRoutes = require('./routes/account');

const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const multer = require("multer");
const socket = require('socket.io');

const errorController = require('./controllers/errors');

require("dotenv").config();

const User = require('./models/user');
<<<<<<< HEAD
const ConnectionString = process.env.MONGO_DB_ATLAS_API;
=======
const ConnectionString = "----------"; // Mongo Atlas Account Link
>>>>>>> 725b982a7547edca430df3febb65eebb89be7d46

var store = new mongoDbStore({
    uri: ConnectionString,
    collection: "mySessions"
});

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, "./public/img/");
    },
    filename: function (req,file,cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        //resimlere benzersiz isimler verme
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).single("image"));
app.use(cookieParser());
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    },
    store: store
}));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {

    if (!req.session.user) {
        return next();
    }
    
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { console.log(err) });
});

app.use(csurf());
app.use('/admin', adminRoutes);
app.use(userRoutes);
app.use(accountRoutes);

app.use(errorController.get404Page);

mongoose.connect(ConnectionString)
    .then(() => {
        console.log('connected to mongodb');

        const server = app.listen(3000);

        const io = socket(server);

        io.on('connection',function(socket){
            console.log('Socket connection is succesful.',socket.id);
        })
    })
    .catch(err => {
        console.log(err);
    });


