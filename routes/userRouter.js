const express = require('express')
const router = express.Router()
const { signup, userLoginWithData, userLogin, registration, getAllProducts, otpLogin, checkOtp } = require('../controllers/userController')
const { validateUser, afterlogin } = require('../middlewares/userMiddlewares')

// landing page => GET 'http://localhost:3000' Users can search products and add to cart(temp) and see detailed view of a products
router.get('/', validateUser, getAllProducts)
// user signup => POST /user/registration
router.get('/user/registration', signup)
router.post('/user/registration', registration)
// user signin => POST user/login
router.get('/user/login', afterlogin, userLogin)
router.post('/user/login', userLoginWithData)
//sendOTP GET => user/loginWithOtp
router.get('/user/otpLogin', otpLogin)
//sendOTP POST => user/checkotp
router.post('/user/checkotp', checkOtp)

// prodect detailed view => GET user/product/:id
// product view by category => GET user/product/:category

module.exports = router
