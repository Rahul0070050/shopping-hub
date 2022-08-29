const mongoose = require("mongoose")

module.exports = function () {
    mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, { useNewUrlParser: true })
    
    mongoose.connection.once('open', function () {
        console.log('server connected');
    }).on('error', function (err) {
        console.log(err);
    })

}