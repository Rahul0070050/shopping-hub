const mongoose = require("mongoose")

module.exports = function () {
    mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: truegi})
    const db = mongoose.connection
    
    db.once('open', function () {
        console.log("hi");
        console.log('server connected');
    })
    db.on('error', function (err) {
        console.error.bind(err);
    })

}