const jwt = require('jsonwebtoken');
const { verifyjwtToken } = require('../helpers/userHelpers');
module.exports = {
    validateUser: (req,res,next) => {
        token = req.headers.cookie.split('=')[1];
        if(verifyjwtToken(token)) {
            next()
        } else res.redirect('/user/login') 
    },
    afterlogin: (req,res,next) => {
        token = req.headers.cookie.split('=')[1];
        if(verifyjwtToken(token)) {
            res.redirect('/')
        } else next() 
    }
}