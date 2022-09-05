const { genarateHashPassword, createjwtToken, varifyHashedPassword, sendOTP, genarateOtp, validationform } = require("../helpers/userHelpers");
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
    registration: (req, res) => {
        try {
            let {
                username,
                email,
                phone
            } = req.body;
            validationform(username, email).then(async result => {
                if (result) {
                    res.status(406).json({ ok: false, msg: result })
                } else {
                    // OTP send
                    genarateOtp().then(otp => {
                        console.log('otp genarated successfully');
                        sendOTP(phone, otp).then(otpResponse => {
                            console.log('otp sent successfully');
                            // save otp in db with timer

                            res.status(200).json({ ok: true })
                            delete req.body.cunfirmPassword
                            let otpValue = {
                                timer: new Date(new Date().getTime() + 60 * 1000).toLocaleTimeString(),
                                otp
                            }
                            req.body.otp = otpValue
                            req.session.user = req.body
                            req.session.save((res) => {
                                console.log('session rewrited');
                            })
                        }).catch(err => {
                            console.log(err);
                            res.status(406).json({ ok: false, msg: 'phone number in invalid' })
                        })
                    })
                }
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
                            console.log('otp genarated successfully');

                            sendOTP(response.phone, otp).then(otpResponse => {
                                console.log('otp send successfully');

                                // save otp in db with timer
                                let otp = {
                                    timer: new Date(new Date().getTime() + 60 * 1000).toLocaleTimeString(),
                                    otp
                                }
                                req.session.user = response
                                req.session.save((res) => {
                                    console.log('session rewrited');
                                })
                            }).catch(err => {
                                console.log(err.message);
                            })
                        })
                        res.status(200).json({ ok: true })
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
    },
    checkOtp: (req, res) => {
        try {
            let { otp } = req.body;
            otpNumber = Number(otp)
            if (isNaN(otpNumber)) {
                res.status(406).json({ ok: false, msg: 'invalid otp' })
            } else {
                const timeNow = new Date().toLocaleTimeString();

                let { otp, timer } = req.session.user.otp;
                otp = Number(otp)
                if (timeNow >= timer) {
                    // timer expired
                    res.status(408).json({ ok: false, msg: 'timer is expired try again' })
                    return;
                }
                if (otpNumber != otp) {
                    res.status(406).json({ ok: false, msg: 'incurrect otp' })
                } else {
                    const { username, email, password, phone } = req.session.user
                    delete req.session.user.password
                    // console.log(username, email, password, phone);
                    new User({
                        username,
                        email,
                        phone,
                        password,
                        status: true
                    }).save().then(data => {
                        console.log('user created successfully');
                        delete data.password
                        req.session.user = data;
                        req.session.save((res) => {
                            console.log('session rewrited');
                        })
                        res.status(200).json({ ok: true, msg: 'success' })
                    }).catch(error => {
                        // bad request
                        console.log(error.message);
                    })
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    }
}