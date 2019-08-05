const mongoose = require('mongoose');
const {isEmail} = require("validator");

const loginSchema = mongoose.Schema({
    email: {
        type: String,
        validate: [isEmail, "False email!"]
    },
    password: {
        type: String,
        required: [true, "Enter password!"]
    }
});



module.exports = mongoose.model('Login', loginSchema);


