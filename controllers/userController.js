const { genarateHashPassword, createjwtToken, varifyHashedPassword, sendSMS, genarateOtp } = require("../helpers/userHelpers");
const User = require("../models/userSchema")

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
                password,
                status: true
            }).save().then(data => {
                res.status(200).json({ ok: true })
            }).catch(error => {
                // bad request
                res.status(400).json({ ok: false, msg: Object.keys(error.keyPattern)[0] })
                console.log(error.message);
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
                    if (varifyHashedPassword(response.password, password)) {
                        // OTP send
                        genarateOtp().then(otp => {
                            console.log(otp);
                        })
                        // sendSMS(response.phone).then(response => {
                        //     console.log(response);
                        // }).catch(err => {
                        //     console.log(err.message);
                        // })
                        // res.status(200).json({ ok: true })
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
    },
    otpLogin: (req, res) => {
        res.render('user/otpLogin')
    }
}