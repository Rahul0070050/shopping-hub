const { default: mongoose } = require("mongoose");

const Product = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: [{
        type: Array,
    }],
    price: {
        type: Number,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    // if  its a dress
    itemSize: [{
        type: Number,
    }],
    mainImage: {
        Type: String,
        required: true
    },
    itemSubImages: [{
        type: String,
    }],
    discount: {
        type : Number,
    },
    cound:{
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        dafault: Date.now
    },
    questions: mongoose.Types.ObjectId,
    itemReview: mongoose.Types.ObjectId
});


module.exports = mongoose.model('products',Product)