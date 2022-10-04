const mongoose = require('mongoose');

const WishList = new mongoose.Schema({
    user_id: {
        type: String
    },
    product_id: {
        type: String
    },
    pro_price: {
        type: String
    },
    pro_image: {
        type: String
    },
    pro_description: {
        type: String
    },
    pro_name: {
        type: String
    },
})


module.exports = mongoose.model('wishlist',WishList)