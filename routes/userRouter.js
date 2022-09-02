const express = require('express')
const { signup, userLoginWithData, userLogin, registration, getAllProducts, otpLogin } = require('../controllers/userController')
const { validateUser, afterlogin } = require('../middlewares/userMiddlewares')
const router = express.Router()

// landing page => GET 'http://localhost:3000' Users can search products and add to cart(temp) and see detailed view of a products
router.get('/',validateUser, getAllProducts)
// user signup => POST /user/registration
router.get('/user/registration', signup)
router.post('/user/registration', registration)
// user signin => POST user/login
router.get('/user/login',afterlogin, userLogin)
router.post('/user/login', userLoginWithData)
//sendOTP POST => user/loginWithOtp
router.get('/user/otpLogin',otpLogin)
// prodect detailed view => GET user/product/:id
// product view by category => GET user/product/:category

module.exports = router
