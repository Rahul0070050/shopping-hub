const { genarateHashPassword, createjwtToken, varifyHashedPassword } = require("../helpers/userHelpers");
const User = require("../models/userSchema")

const print = console.log;
// const products = {}
module.exports = {
    getAllProducts: (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/products')
            // User.find({}).then(products => {})
        } catch (error) {
            console.error(error)
        }
    },
    signup: (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/signup')
        } catch (error) {
            console.error(error)
        }
    },
    registration: async (req, res) => {
        try {
            let { username,
                email,
                phone,
                password } = req.body;
            password = await genarateHashPassword(password)
            new User({
                username,
                email,
                phone,
                password
            }).save().then(data => {
                res.status(200).json({ ok: true })
            }).catch(error => {
                // bad request
                res.status(400).json({ ok: false, msg: Object.keys(error.keyPattern)[0] })
                console.log(error);
            })
        } catch (error) {
            console.error(error)
        }
    },
    userLogin: (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/signin')
        } catch (error) {
            console.error(error)
        }
    },
    userLoginWithData: (req, res) => {
        const { username, password } = req.body;
        try {
            User.findOne({ username: username }).then(async response => {
                if (response) {
                    if ( varifyHashedPassword(response.password,password)) {
                        createjwtToken(response).then(token => {
                            res.cookie('jwt',token,{httpOnly:true,maxAge: 24*60*60*1000})
                            res.status(200).json({ ok: true })
                        })
                    } else {
                        // Aot Acceptable
                        res.status(406).json({ ok: false, msg: 'password not match' })
                    }
                } else {
                    res.status(404).json({ ok: false, msg: 'user not found' })
                }
            })
        } catch (error) {
            console.error(error)
        }
    }
}