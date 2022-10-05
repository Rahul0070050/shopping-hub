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
const Coupon = require("../models/couponScheema");
const WishList = require("../models/wishListScheema");
const productSchema = require("../models/productSchema");

module.exports = {
    getAllProducts: (req, res) => {
        try {
            Product.find({}).then(products => {
                Category.find({}).limit(7).then(categories => {
                    if (req.session?.user?.logedin) {
                        Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).count().then(count => {
                            res.setHeader('Cache-Control', 'no-store')
                            res.render('user/products', { products, categories, user: req.session?.user, count })
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
        try {

        } catch (error) {

        }
    },
    viewSingleProduct: (req, res) => {
        try {
            const { id } = req.params;
            Product.findById(id).then(product => {
                WishList.find({ user_id: req.session?.user?.user?._id, product_id: product._id }).then(wishList => {
                    Product.find({ category: product.category }).limit(3).then(products => {
                        res.setHeader('Cache-Control', 'no-store')
                        res.render('user/singleProduct', { product, products, user: req.session.user, wishList })
                    })
                })
            })
        } catch (error) {

        }
    },
    getCart: (req, res) => {
        try {
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
                            let id = req.session?.user?.user?._id
                            Coupon.find({ valid_from: { $lt: totalValue }, StartsDate: { $lte: new Date() }, EndsDate: { $gt: new Date() }, user_arr: { $nin: [id] } }).then(coupons => {
                                res.render('user/cart', { cart, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user, coupons })
                            })
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

                        let id = req.session?.user?.user?._id
                        console.log(req.session?.user?.user?._id)

                        Coupon.find({ valid_from: { $lt: totalValue }, StartsDate: { $lte: new Date() }, EndsDate: { $gte: new Date() }, user_arr: { $nin: [id] } }).then(coupons => {
                            res.render('user/cart', { cart: result, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user, coupons })
                        })
                    })
                }
            } else {
                let totalValue = req?.session?.cart?.reduce((prev, obj) => prev + obj.total, 0)
                let shippingCharges = req?.session?.cart?.reduce((prev, obj) => prev + obj.shippingCharges, 0)
                let realPrice = req?.session?.cart?.reduce((prev, obj) => prev + (obj.price * obj.count), 0)
                let cartItemCound = req?.session?.cart?.length
                res.render('user/cart', { cart: req?.session?.cart, totalValue, shippingCharges: Math.round(shippingCharges), realPrice, cartItemCound, user: req.session.user })
            }
        } catch (error) {

        }

    },
    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/')
    },
    addToCart: async (req, res) => {
        try {
            const { id } = req.body
            if (req.session?.user?.logedin) {
                // console.log(id);
                Cart.find({ product_id: ObjectId(id), user_id: ObjectId(req.session.user?.user?._id) }, { name: 1, price: 1, mainImage: 1, discountedPrice: 1, discription: 1 }).then(product => {
                    WishList.deleteOne({ product_id: id }).then(response => {
                        console.log(response)
                    })
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
        } catch (error) {

        }
    },
    incrementItemCount: (req, res) => {
        try {
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
        } catch (error) {

        }
    },
    decrementItemCount: (req, res) => {
        try {
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
        } catch (error) {

        }
    },
    checkout: (req, res) => {
        try {
            Address.find({ user_id: mongoose.Types.ObjectId(req.session?.user?.user?._id) }).then(address => {
                Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(prod => {
                    let total = prod?.reduce((prev, obj) => prev + obj.total, 0)
                    res.render('user/checkout', { address, user: req.session.user, total })
                })
            })
        } catch (error) {

        }
    },
    deleteProduct: (req, res) => {
        try {
            const { id } = req.body
            if (req.session?.user?.logedin) {
                Cart.deleteOne({ _id: ObjectId(id) }).then(result => {
                    res.status(200).json({ ok: true })
                })
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
        } catch (error) {

        }
    },
    orderProduct: (req, res) => {
        try {
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
        } catch (error) {

        }
    },
    addAddress: (req, res) => {
        try {
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
        } catch (error) {

        }
    },
    placeOrder: (req, res) => {
        try {
            const { address, products, payment_methode } = req.session?.order;
            // console.log(result)
            if (req.session?.order != null) {
                let prop = {
                    code: null,
                    cashBack: null
                }
                let { code, cashBack } = req.session?.coupon || prop;
                cashBack = Math.ceil(cashBack / products.length)
                if (!isNaN(cashBack)) {

                    for (let product of products) {
                        product.total = product.total - cashBack
                    }
                }
                Coupon.updateOne({ code }, { $push: { user_arr: req.session?.user?.user?._id } }).then(result => {
                    console.log(result)
                })
                req.session.coupon = null
                req.session.order.product = products;

                req.session.save(err => {
                    console.log('session')
                })

                for (let i = 0; i < products.length; i++) {
                    // console.log(req.session?.order?.payment_methode)
                    Product.updateOne({ _id: (products[i].product_id) }, { $inc: { quantity: -products[i].count } }).then(result => {
                        // console.log(products[i].shippingCharges)
                        // console.log(req.session.order.payment_methode)
                        new Orders({
                            user_id: address[0].user_id,
                            user_name: address[0].full_name,
                            product_name: products[i].name,
                            product_price: products[i].total,
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
        } catch (error) {

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
                    createdAt: -1
                }
            }
        ]).then(order => {
            Coupon.find({ user_arr: { $nin: req.session?.user?.user?._id } }).then(coupons => {
                res.render('user/userProfile', { logedin: true, user: req.session.user, order, coupons })
            })
        })
    },
    cancelOrder: (req, res) => {
        const { order_id } = req.body
        Orders.updateOne({ _id: ObjectId(order_id) }, { cancel_order: true, order_status: 'cancelled' }).then(result => {
            res.status(200).json({ ok: true })
        })
    },
    getUserData: (req, res) => {
        Cart.find({ user_id: ObjectId(req.session?.user?.user?._id) }).then(result => {
            WishList.find({ user_id: req.session?.user?.user?._id }).then(wishList => {
                res.status(200).json({ cartCount: result.length, wishListCount: wishList.length })
            })
        })
    },
    tryCouponCode: (req, res) => {
        const { code } = req.body
        console.log(code)
        Coupon.find({ code }).then(result => {
            console.log(result)
        })
    },
    applyCoupon: (req, res) => {
        const { code } = req.body
        Coupon.find({ code }).then(response => {
            if (response[0]) {
                req.session.coupon = response[0]
                res.status(200).json({ ok: true, coupon: response[0] })
            } else {
                req.session.coupon = null
                res.status(200).json({ ok: false })
            }
            req.session.save(() => {
                console.log('session saved')
            })
        })
    },
    wishLst: (req, res) => {
        // WishList.find({ user_id: req.session?.user?.user?._id }).then(wishList => {
        WishList.aggregate([
            {
                $match: {
                    user_id: req.session?.user?.user?._id
                }
            }
        ]).then(wishList => {
            console.log(wishList)
            res.render('user/wishList', { wishList, logedin: true, user: req.session.user })
        })

        // })
    },
    addItemFromWishList: (req, res) => {
        const { id } = req.body
        Product.findById(id).then(product => {
            WishList.find({ product_id: product._id }).then(result => {
                if (result != []) {
                    new WishList({
                        user_id: ObjectId(req.session?.user?.user?._id),
                        product_id: ObjectId(id),
                        pro_price: product.discountedPrice,
                        pro_image: product.mainImage,
                        pro_description: product.discription,
                        pro_name: product.name
                    }).save().then(result => {
                        res.status(200).json({ ok: true })
                    })
                }
            })
        })
    },
    removeItemFromWishList: (req, res) => {
        const { id } = req.body
        WishList.deleteOne({ user_id: ObjectId(req.session?.user?.user?._id), product_id: ObjectId(id) }).then(result => {
            res.status(200).json({ ok: true })
        })
    }
}