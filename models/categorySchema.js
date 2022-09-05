const { default: mongoose } = require("mongoose");

const Category = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('category',Category)