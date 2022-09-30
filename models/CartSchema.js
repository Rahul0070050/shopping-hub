const mongoose = require('mongoose');


const Cart = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    discountedPrice: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    // this fiels for showing the product is use a coupon; each product can have only one 'coupon'
    coupon: {
        type: Boolean,
    },
    shippingCharges: {
        type: Number,
        required: true
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    product_id: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('cart', Cart)