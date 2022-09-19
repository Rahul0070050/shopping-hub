const mongoose = require("mongoose")

module.exports = function () {
    mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        autoIndex: true,
    })
    const db = mongoose.connection

    db.once('open', function () {
        console.log('mongodb connected');
    })
    db.on('error', function (err) {
        console.error(err);
    })

}