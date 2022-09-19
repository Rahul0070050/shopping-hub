const { default: mongoose } = require("mongoose");

const Product = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    category: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    mainImage: {
        type: String,
        required: true
    },
    itemSubImages: [{
        type: String,
    }],
    discount: {
        type : Number,
    },
    discountedPrice: {
        type : Number,
    },
    quantity:{
        type: Number,
        required: true
    },
    questions: mongoose.Types.ObjectId,
    itemReview: mongoose.Types.ObjectId
},{timestamps:true});


module.exports = mongoose.model('products',Product)