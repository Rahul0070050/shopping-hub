const { genarateHashPassword, createjwtToken, varifyHashedPassword, sendOTP, genarateOtp, validationform } = require("../helpers/userHelpers");
const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Category = require("../models/categorySchema")

module.exports = {
    getAllProducts: (req, res) => {
        try {
            Product.find({}).then(products => {
                Category.find({}).then(categories => {
                    console.log(categories);
                    res.setHeader('Cache-Control', 'no-store')
                    console.log(req.session.user);
                    res.render('user/products', { products, categories, user: req.session?.user?.user })
                    console.log(req.session.user);
                })
            })
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
                            let user = {
                                user: req.body,
                                otp: otpValue,
                                login: false // user form signup form
                            }
                            req.session.user = user;
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
                    varifyHashedPassword(response.password, password).then(passwordRes => {
                        if (passwordRes) {
                            // OTP send
                            genarateOtp().then(otpNumber => {
                                console.log('otp genarated successfully');

                                sendOTP(response.phone, otpNumber).then(otpResponse => {
                                    console.log('otp send successfully');

                                    // save otp in db with timer
                                    let otp = {
                                        timer: new Date(new Date().getTime() + 60 * 1000).toLocaleTimeString(),
                                        otp: otpNumber

                                    }
                                    response.logedin = true
                                    let user = {
                                        otp,
                                        user: response,
                                        login: true // remember user form login form
                                    }
                                    req.session.user = user
                                    req.session.save(data => {
                                        console.log('session saved')
                                        createjwtToken(user).then(jwt => {
                                            res.cookie(`jwt`, jwt);
                                            res.status(200).json({ ok: true, msg: 'success' })
                                        })
                                    })
                                }).catch(err => {
                                    console.log(err.message);
                                })
                            })
                        } else {
                            // Aot Acceptable
                            res.status(406).json({ ok: false, msg: 'password not match' })
                        }
                    })

                } else {
                    res.status(404).json({ ok: false, msg: 'user not found' })
                }
            })
        } catch (error) {
            console.error(error)
        }
    },
    otpLogin: (req, res) => {
        res.setHeader('Cache-Control', 'no-store')
        res.render('user/otpLogin')
    },
    checkOtp: (req, res) => {
        console.log('hi');
        try {
            let { otp } = req.body;
            console.log(otp);
            let otpNumber = Number(otp)
            if (isNaN(otpNumber)) {
                res.status(406).json({ ok: false, msg: 'invalid otp' })
            } else {
                const timeNow = new Date().toLocaleTimeString();
                let { otp, timer } = req.session?.user?.otp;
                otp = Number(otp)
                if (timeNow >= timer) {
                    // timer expired
                    res.status(408).json({ ok: false, msg: 'timer is expired try again' })
                    return;
                }
                if (otpNumber != otp) {
                    res.status(406).json({ ok: false, msg: 'incurrect otp' })
                } else {
                    if (req.session.user.login) { // if user from login form
                        res.status(200).json({ ok: true, msg: 'success' })
                    } else { // user come from (signup) form

                        const { username, email, password, phone } = req.session.user.user
                        genarateHashPassword(password).then(pass => {
                            // console.log(username, email, password, phone);
                            new User({
                                username,
                                email,
                                phone,
                                password: pass,
                                status: true
                            }).save().then(data => {
                                console.log('user created successfully');
                                delete data.password
                                data.logedin = true
                                req.session.user = data;
                                req.session.save((res) => {
                                    console.log('session rewrited');
                                    console.log(req.session);
                                })
                                createjwtToken(data).then(jwt => {
                                    console.log(jwt);
                                    res.cookie(`jwt`, jwt);
                                    res.status(200).json({ ok: true, msg: 'success' })
                                })
                            }).catch(error => {
                                // bad request
                                console.log(error.message);
                                console.log(1);
                            })
                        })

                    }
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    viewSingleProduct: (req, res) => {
        const { id } = req.params;
        Product.findById(id).then(product => {
            console.log(product);
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/singleProduct', { product, category: false, logedin: true })
        })
    }
}