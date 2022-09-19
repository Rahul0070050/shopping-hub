const jwt = require('jsonwebtoken');
const { verifyjwtToken } = require('../helpers/userHelpers');
const User = require('../models/userSchema')

module.exports = {
    validateUser: (req, res, next) => {
        let token = req.headers?.cookie?.split(';')[1]?.split('=')[1];
        if (token) {
            console.log(verifyjwtToken(token))
            verifyjwtToken(token).then((state) => {
                if(state) {
                    next()
                } else res.redirect('/user/login')
            })
        } else {
            res.redirect('/user/login')
        }
    },
    afterlogin: (req, res, next) => {
        let token = req.headers?.cookie?.split(';')[1]?.split('=')[1];
        if (token) {
            verifyjwtToken(token).then((state) => {
                if(state) {
                    res.redirect('/')
                } else next()
            })
        } else next()
    },
    isUserBlocked: (req, res, next) => {
        let id = req.session?.user?.user?._id;
        if (id) {
            User.findById(id).then(user => {
                if (user.status) {
                    next()
                } else {
                    res.render('user/userBlocked')
                }
            })
        } else next()
    }
}