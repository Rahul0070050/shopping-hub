const mongoose = require('mongoose');

const Coupon = new mongoose.Schema({
    code: {
        type: String,
    },
    StartsDate: {
        type: String,
    },
    EndsDate: {
        type: String
    },
    discountPercentage: {
        type: Number
    },
    used: {
        type: Boolean,
        dafault: false
    },
    valid_from: {
        type: Number
    },
    coupon_taken: {
        type: Boolean
    }
})

module.exports = mongoose.model('coupons',Coupon)