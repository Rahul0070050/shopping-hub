const express = require('express')

const { adminLoginWithData, AdminLogin, getAllUsers, getSingleUSer, getProducts, getAddProductPage,addProduct ,addCategory} = require('../controllers/adminController')

const router = express.Router()


// login GET
router.get('/admin_login', AdminLogin)
// login POST
router.post('/admin_login', adminLoginWithData)

// admin pannel =>GET admin_panel (products datas,users datas,order datas, revanew,transactions)
// view users =>GET admin_panel/user
router.get('/admin_panel/users', getAllUsers)
// POST => admin_panel/user/id
router.get('/admin_panel/user/:id', getSingleUSer)
// POST => admin_panel/user/block/id
// POST => admin_panel/user/unblock/id
// POST => admin_panel/add
router.post('/admin_panel/addCategory', addCategory)
// GET => admin_panel/get_products_by_category/id
// GET => /admin_panel/getProduct
router.get('/admin_panel/getProduct', getProducts)
// add products =>  GET admin_panel/add_product
router.get('/admin_panel/add_product', getAddProductPage)
router.post('/admin_panel/add_product', addProduct)
// delete product => DELETE admin_panel/delete_product/id
// PUT admin_panel/edit_product/id


module.exports = router