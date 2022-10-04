const mongoose = require('mongoose');

const Orders = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    product_id: {
        type: mongoose.Types.ObjectId
    },
    product_name: {
        type: String
    },
    product_price: {
        type: Number
    },
    product_count:{
        type: Number
    },
    product_shipping_charge:{ 
        type: Number
    },
    order_status: {
        type: String
    },
    payment_methode:{
        type: String
    },
    order_status: {
        type: String,
        default: 'ordered'
    },
    order_completed_percentage: {
        type: Number,
        default: 10
    },
    cancel_order: {
        type: Boolean,
        default: false
    },
    date: {
        type: String
    }
},{
    timestamps: true
})


module.exports = mongoose.model('order',Orders)