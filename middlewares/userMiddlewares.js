const jwt = require('jsonwebtoken');
const { verifyjwtToken } = require('../helpers/userHelpers');
module.exports = {
    validateUser: (req,res,next) => {
        let token = req.headers?.cookie?.split('=')[1];
        if(token){
            if(verifyjwtToken(token)) {
                next()
            } else res.redirect('/user/login') 
        } else res.redirect('/user/login') 
    },
    afterlogin: (req,res,next) => {
        let token = req.headers?.cookie?.split('=')[1];
        if(token) {
            if(verifyjwtToken(token)) {
                res.redirect('/')
            } else next() 
        } else next()
    }
}