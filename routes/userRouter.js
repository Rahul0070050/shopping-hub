const express = require('express')
const { registration, signup } = require('../controllers/userController')
const router = express.Router()

// user signup => POST /user/registration
router.get('/registration',signup)
router.post('/registration', registration)
// user signin => POST user/login
// list products =>  GET user/all_products
// prodect detailed view => GET user/product/:id
// product view by category => GET user/product/:category

module.exports = router
