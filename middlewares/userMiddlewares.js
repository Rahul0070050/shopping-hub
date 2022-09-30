const jwt = require('jsonwebtoken');
const { verifyjwtToken } = require('../helpers/userHelpers');
const User = require('../models/userSchema')

module.exports = {
    validateUser: (req, res, next) => {
        if (req.session?.user?.logedin) {
            next()
        } else {
            res.redirect('/user/login')
        }
    },
    afterlogin: (req, res, next) => {
        if (req.session?.user?.logedin) {
            res.redirect('/')
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