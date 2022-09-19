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

user.virtual('some_fun').get(function() {
    return "name is: " + this.username + " email is :" + this.email
})
module.exports = mongoose.model('users', user);