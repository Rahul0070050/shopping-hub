const mongoose = require("mongoose");


const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    phone: {
        type: Number,
        unique: false,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: Boolean,
    address: mongoose.Schema.ObjectId
});
module.exports = mongoose.model('users', user);