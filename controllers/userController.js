const { ObjectId } = require("mongoose").Types
const { default: mongoose } = require("mongoose");
const { v4: uuId } = require('uuid');
const crypto = require("crypto");
require('dotenv').config()
// var { validatePaymentVerification } = require('./dist/utils/razorpay-utils');

const { genarateHashPassword, createjwtToken, varifyHashedPassword, sendOTP, genarateOtp, validationform, genarateRazorpay } = require("../helpers/userHelpers");

const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const Category = require("../models/categorySchema")
const Cart = require("../models/CartSchema");
const Address = require("../models/addressSchema");
const Orders = require("../models/orderSchema");

module.exports = {
    getAllProducts: (req, res) => {
        try {
            Product.find({}).then(products => {
                Category.find({}).limit(7).then(categories => {
                    if (req.session?.user?.logedin) {
                        Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).count().then(count => {
                            res.setHeader('Cache-Control', 'no-store')
                            res.render('user/products', { products, categories, user: req.session?.user,count })
                        })
                    } else {
                        res.setHeader('Cache-Control', 'no-store')
                        res.render('user/products', { products, categories, user: req.session?.user })
                    }
                })
            })
        } catch (error) {
            console.error(error)
        }
    },
    signup: (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/signup', { loginPage: true })
        } catch (error) {
            console.error(error)
        }
    },
    registration: (req, res) => {
        try {
            // console.log(req.body);
            let {
                username,
                email,
                phone,
                password
            } = req.body;
            genarateHashPassword(password).then(pass => {
                validationform(username, email).then(async result => {
                    if (result) {
                        res.status(406).json({ ok: false, msg: result })
                    } else {
                        new User({
                            username,
                            email,
                            phone,
                            password: pass,
                            status: true
                        }).save().then(data => {
                            console.log('user created successfully');
                            delete data.password
                            let obj = {
                                user: data,
                                logedin: true,
                                login: false // remember user form login form
                            }
                            req.session.user = obj;
                            req.session.save((err) => {
                                console.log('session rewrited');
                                res.status(200).json({ ok: true, msg: 'success', user: req.session.user.user })
                            })
                        }).catch(error => {
                            // bad request
                            console.log(error.message);
                        })
                    }
                })
            })


        } catch (error) {
            console.error(error)
        }
    },
    userLogin: (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store')
            res.render('user/signin', { loginPage: true })
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
                            let user = {
                                user: response,
                                logedin: true,
                                login: true // remember user form login form
                            }
                            req.session.user = user
                            req.session.save(data => {
                                console.log('session saved')
                                res.status(200).json({ ok: true, msg: 'success' })
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
        res.render('user/otpLogin', { loginPage: false, number: req.session?.user?.user?.phone })
    },
    checkOtp: (req, res) => {
        // console.log(req?.session?.user);
        try {
            let { otp } = req.body;
            let otpNumber = Number(otp)
            if (isNaN(otpNumber)) {
                res.status(406).json({ ok: false, msg: 'invalid otp' })
            } else {
                const timeNow = new Date().toLocaleTimeString();
                let { otp, timer } = req.session?.user?.otp;
                otp = Number(otp)
                if (timeNow >= timer) {
                    // timer expired
                    res.status(408).json({ ok: false, msg: 'timer is expired resent otp' })
                    return;
                }
                if (otpNumber != otp) {
                    res.status(406).json({ ok: false, msg: 'incurrect otp' })
                } else {
                    if (req.session.user.login) { // if user from login form
                        res.status(200).json({ ok: true, msg: 'success', user: req.session.user.user })
                    } else { // user come from (signup) form

                        const { username, email, password, phone } = req.session.user.user
                        genarateHashPassword(password).then(pass => {
                            // console.log(username, email, password, phone);
                            // new User({
                            //     username,
                            //     email,
                            //     phone,
                            //     password: pass,
                            //     status: true
                            // }).save().then(data => {
                            //     console.log('user created successfully');
                            //     delete data.password
                            //     let obj = {
                            //         user: data,
                            //         logedin: true,
                            //         login: false // remember user form login form
                            //     }
                            //     req.session.user = obj;
                            //     req.session.save((res) => {
                            //         console.log('session rewrited');
                            //         res.status(200).json({ ok: true, msg: 'success', user: req.session.user.user })
                            //     })
                            // }).catch(error => {
                            //     // bad request
                            //     console.log(error.message);
                            //     console.log(1);
                            // })
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
            Product.find({ category: product.category }).limit(3).then(products => {
                // console.log(product);
                res.setHeader('Cache-Control', 'no-store')
                res.render('user/singleProduct', { product, products, user: req.session.user })
            })
        })
    },
    getCart: (req, res) => {
        if (req.session?.user?.logedin) {
            if (req.session?.cart) {

                let cart = req.session?.cart
                let product = [];

                for (let i = 0; i < cart.length; i++) {
                    // console.log(cart[i]._id)
                    product[i] = { ...cart[i], user_id: req.session?.user?.user?._id, product_id: cart[i]._id };
                    delete product[i]._id
                }

                console.log('befor inserting cart to db')
                Cart.insertMany(product).then((result) => {


                    Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(cart => {
                        let totalValue = cart?.reduce((prev, obj) => prev + obj.total, 0)
                        let shippingCharges = cart?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
                        let realPrice = cart?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)
                        let cartItemCound = cart?.length
                        // console.log(cart)
                        res.render('user/cart', { cart, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user })
                    })

                    req.session.cart = null
                    req.session.save(err => {
                        if (!err) {
                            console.log('cart removed from session');
                        }
                    })

                })
            } else {
                Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(result => {
                    let totalValue = result?.reduce((prev, obj) => prev + obj.total, 0)
                    let shippingCharges = result?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
                    let realPrice = result?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)
                    let cartItemCound = result?.length
                    res.render('user/cart', { cart: result, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user })
                })
            }
        } else {
            let totalValue = req?.session?.cart?.reduce((prev, obj) => prev + obj.total, 0)
            let shippingCharges = req?.session?.cart?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
            let realPrice = req?.session?.cart?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)
            let cartItemCound = req?.session?.cart?.length
            res.render('user/cart', { cart: req?.session?.cart, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user })
        }
    },
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/')
    },
    addToCart: async (req, res) => {
        const { id } = req.body
        if (req.session?.user?.logedin) {
            // console.log(id);
            Cart.find({ product_id: ObjectId(id), user_id: ObjectId(req.session.user?.user?._id) }, { name: 1, price: 1, mainImage: 1, discountedPrice: 1, discription: 1 }).then(product => {
                if (product.length > 0) {
                    res.status(200).json({ ok: false })
                } else {
                    Product.findById(id).then(item => {
                        new Cart({
                            name: item.name,
                            price: item.price,
                            discription: item.discription,
                            mainImage: item.mainImage,
                            discountedPrice: item.discountedPrice,
                            count: 1,
                            total: item.discountedPrice * 1,
                            shippingCharges: Math.round(0.02 * item.discountedPrice),
                            user_id: req.session.user?.user?._id,
                            product_id: item._id
                        }).save().then(result => {
                            if (result) {
                                res.status(200).json({ ok: true })
                            }
                        })
                    })
                }
            })
        } else {

            if (req.session?.cart) {
                let value = await req.session?.cart?.find(elm => {
                    return elm._id == id
                })

                if (!value) {
                    Product.find({ _id: ObjectId(id) }, { name: 1, price: 1, mainImage: 1, discountedPrice: 1, discription: 1 }).then(product => {
                        req.session.cart.push({ ...product[0]._doc, count: 1, total: product[0].discountedPrice * 1, shippingCharges: Math.round(0.02 * product[0].price), })
                        req.session.save((err) => {
                            if (!err) {
                                console.log('cart updated on session');
                                res.status(200).json({ ok: true })
                            }
                        })
                    })
                } else {
                    res.status(200).json({ ok: false })
                    console.log('this product already added to the cart')
                }
            } else {
                req.session.cart = [];
                Product.find({ _id: ObjectId(id) }, { name: 1, price: 1, mainImage: 1, discountedPrice: 1, discription: 1 }).then(product => {
                    req.session.cart.push({ ...product[0]._doc, count: 1, total: product[0].discountedPrice * 1, shippingCharges: Math.round(0.02 * product[0].price), })
                    req.session.save((err) => {
                        if (!err) {
                            console.log('cart created on session');
                            res.status(200).json({ ok: true })
                        }
                    })
                })
            }
        }
    },
    incrementItemCount: (req, res) => {
        const { id } = req.body;
        if (req.session?.user?.logedin) {
            Cart.findById(id).then(result => {
                let { count, discountedPrice, price } = result;
                count += 1
                let total = discountedPrice * count
                Cart.updateOne({ _id: ObjectId(id) }, { $set: { total, count } }).then(r => {
                    Cart.findById(id).then(result => {
                        res.status(200).json({ ok: true, db: true, product: result })
                    })
                })
            })

        } else {
            let index = req.session?.cart.findIndex(obj => obj._id === id)
            req.session.cart[index].count = req.session.cart[index].count + 1
            req.session.cart[index].total = req.session.cart[index].discountedPrice * req.session.cart[index].count





            req.session.save((err) => {
                let totalValue = req?.session?.cart?.reduce((prev, obj) => prev + obj.total, 0)
                let shippingCharges = req?.session?.cart?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
                let realPrice = req?.session?.cart?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)

                if (!err) {
                    // console.log(req.session.cart[index]);
                    res.status(200).json({ ok: true, item: req.session.cart[index], totalValue, shippingCharges: Math.round(shippingCharges), realPrice })
                    console.log('product count incremented');
                }
            })
        }
    },
    decrementItemCount: (req, res) => {
        const { id } = req.body;
        if (req.session?.user?.logedin) {
            Cart.findById(id).then(result => {
                let { count, discountedPrice, price } = result;
                count += -1
                let total = discountedPrice * count
                Cart.updateOne({ _id: ObjectId(id) }, { $set: { total, count } }).then(r => {
                    Cart.findById(id).then(result => {
                        res.status(200).json({ ok: true, db: true, product: result })
                    })
                })
            })
        } else {
            let index = req.session?.cart.findIndex(obj => obj._id === id)
            req.session.cart[index].count = req.session.cart[index].count - 1
            req.session.cart[index].total = req.session.cart[index].discountedPrice * req.session.cart[index].count

            req.session.save((err) => {


                let totalValue = req?.session?.cart?.reduce((prev, obj) => prev + obj.total, 0)
                let shippingCharges = req?.session?.cart?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
                let realPrice = req?.session?.cart?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)

                if (!err) {
                    res.status(200).json({
                        ok: true, item: req.session.cart[index], totalValue, shippingCharges: Math.round(shippingCharges), realPrice
                    })
                    console.log('product count incremented');
                }
            })
        }
    },
    checkout: (req, res) => {
        Address.find({ user_id: mongoose.Types.ObjectId(req.session?.user?.user?._id) }).then(address => {
            Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(prod => {
                let total = prod?.reduce((prev, obj) => prev + obj.total, 0)
                res.render('user/checkout', { address, user: req.session.user, total })
            })
        })
    },
    deleteProduct: (req, res) => {
        const { id } = req.body
        if (req.session?.user?.logedin) {

        } else {
            let cart = req.session?.cart?.filter(obj => obj._id != id)
            req.session.cart = cart
            req.session.save((err) => {
                if (!err) {
                    console.log('item deleted');
                    res.status(200).json({ ok: true, cart: req.session?.cart })
                }
            })
        }
    },
    orderProduct: (req, res) => {
        const { address, payment_methode } = req.body;
        if (address) {
            Cart.find({ user_id: req.session?.user?.user?._id }).then(products => {
                // console.log(products)
                Address.find({ _id: mongoose.Types.ObjectId(address) }).then(address => {

                    let orderId = uuId()

                    req.session.order = { products, address, payment_methode }
                    req.session.order.orderId = orderId

                    req.session.save(err => {
                        // console.log(req.session.order)
                        if (!err) {
                            console.log('session updated')
                            if (payment_methode == 'razorpay') {
                                let totalValue = products?.reduce((prev, product) => prev + product.total, 0)
                                genarateRazorpay(orderId, totalValue).then(result => {
                                    console.log(result)
                                    res.status(200).json({ ok: true, msg: 'razorpay', response: result })
                                })
                            } else {
                                res.status(200).json({ ok: true })
                            }
                        }
                    })
                })
            })
        }
    },
    addAddress: (req, res) => {
        const { full_name,
            email,
            address,
            city,
            country,
            state,
            pincode } = req.body
        new Address({
            full_name,
            email,
            address,
            city,
            country,
            state,
            pincode,
            user_id: req.session?.user?.user?._id
        }).save().then(result => {
            console.log(result)
            res.status(200).json({ ok: true, result })
        })
    },
    placeOrder: (req, res) => {
        const { address, products, payment_methode } = req.session?.order;
        // console.log(result)
        if (req.session?.order) {
            for (let i = 0; i < products.length; i++) {
                // console.log(req.session?.order?.payment_methode)
                Product.updateOne({ _id: (products[i].product_id) }, { $inc: { quantity: -products[i].count } }).then(result => {
                    // console.log(products[i].shippingCharges)
                    // console.log(req.session.order.payment_methode)
                    new Orders({
                        user_id: address[0].user_id,
                        user_name: address[0].full_name,
                        product_name: products[i].name,
                        product_price: Math.round(products[i].discountedPrice * products[i].count),
                        product_id: products[i].product_id,
                        product_count: products[i].count,
                        product_shipping_charge: Math.round(products[i].shippingCharges),
                        payment_methode: payment_methode,
                        date: new Date().toLocaleDateString()
                    }).save(result => {
                        // console.log(result)
                    })
                })
            }
            let totalValue = products?.reduce((prev, product) => prev + product.total, 0)
            let price = products?.reduce((prev, product) => prev + (product.price * product.count), 0)
            let shippingCharges = products?.reduce((prev, product) => prev + product.shippingCharges, 0)

            res.render('user/placeOrder', {
                address: req.session.order.address[0],
                products: req.session.order.products,
                payment_methode: req.session?.order?.payment_methode,
                totalValue,
                price,
                shippingCharges,
                user: req.session.user,
                date: new Date().toLocaleDateString()
            })




            req.session.order = null
            req.session.save(err => {
                if (!err) {
                    Cart.deleteMany({ user_id: mongoose.Types.ObjectId(req.session?.user?.user?._id) }).then((result) => {
                        // console.log(result)
                    })
                    console.log('session rewrited')
                }
            })
        } else {
            res.redirect('/')
        }
    },
    verifPayment: (req, res) => {
        const { response, order } = req.body
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response
        let hash = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        hash.update(razorpay_order_id + "|" + razorpay_payment_id)
        hash = hash.digest('hex')
        if (hash == razorpay_signature) {
            res.status(200).json({ ok: true })
        } else {
            res.status(200).json({ ok: false })
        }
    },
    userProfile: (req, res) => {
        // Orders.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(orders => {
        //     console.log(orders)
        // })
        Orders.aggregate([
            {
                $match: {
                    user_id: ObjectId(req.session?.user?.user?._id)
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "products"
                }
            },
            {
                $unwind: "$products"
            },
            {
                $sort: {
                    order_completed_percentage: -1
                }
            }
        ]).then(order => {
            res.render('user/userProfile', { logedin: true, user: req.session.user, order })
        })
    },
    cancelOrder: (req, res) => {
        const { order_id } = req.body
        Orders.updateOne({ _id: ObjectId(order_id) }, { cancel_order: true, order_status: 'cancelled' }).then(result => {
            console.log(result)
            res.status(200).json({ ok: false })
        })
    },
    getUserData:(req,res) => {
        Cart.find({user_id:ObjectId(req.session?.user?.user?._id)}).then(result => {
            res.status(200).json({cartCount:result.length})
        })
    }
}