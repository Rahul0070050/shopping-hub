const express = require('express')
const router = express.Router()
const { signup, userLoginWithData, userLogin,
    registration, getAllProducts, otpLogin,
    checkOtp, viewSingleProduct, getCart, logout,
    addToCart, incrementItemCount, decrementItemCount,
    checkout, deleteProduct, orderProduct, addAddress,
    getConfirmPage, placeOrder, verifPayment, userProfile,
    cancelOrder, getUserData } = require('../controllers/userController')
const { validateUser, afterlogin, isUserBlocked } = require('../middlewares/userMiddlewares')

router.get('/', isUserBlocked, getAllProducts)

router.get('/user/registration', isUserBlocked, signup)

router.post('/user/registration', isUserBlocked, registration)

router.get('/user/login', isUserBlocked, userLogin)

router.post('/user/login', isUserBlocked, userLoginWithData)

router.get('/user/otpLogin', isUserBlocked, otpLogin)

router.post('/user/checkotp', isUserBlocked, checkOtp)

router.get('/user/single_product/:id', isUserBlocked, viewSingleProduct)

router.get('/user/cart', isUserBlocked, getCart)

router.post('/user/add_to_cart', isUserBlocked, addToCart)

router.get('/user/logout', logout)

router.post('/user/DecrementCartItemCount', decrementItemCount)

router.post('/user/IncrementCartItemCount', incrementItemCount)

router.get('/user/checkOut', isUserBlocked, validateUser, checkout)

router.post('/user/cart/delete', validateUser, deleteProduct)

router.post('/user/order', validateUser, orderProduct)

router.post('/user/addAddress', validateUser, addAddress)

// router.get('/user/conofirmOrder', validateUser, getConfirmPage)

router.get('/user/placeOrder', validateUser, placeOrder)

router.post('/user/cerifyPayment', validateUser, verifPayment)

router.get('/user/profile', validateUser, userProfile)

router.patch('/user/cancelOrder', validateUser, cancelOrder)

router.get('/user/getUserData', validateUser, getUserData)


module.exports = router
