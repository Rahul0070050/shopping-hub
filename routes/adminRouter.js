const express = require('express')

const { adminLoginWithData, AdminLogin,getAllUsers,getSingleUSer } = require('../controllers/adminController')

const router = express.Router()


// login GET
router.get('/admin_login', AdminLogin)
router.post('/admin_login', adminLoginWithData)

// admin pannel =>GET admin_panel (products datas,users datas,order datas, revanew,transactions)
// view users =>GET admin_panel/user
router.get('/admin_panel/users',getAllUsers)
// POST => admin_panel/user/id
router.get('/admin_panel/user/:id',getSingleUSer)
// POST => admin_panel/user/block/id
// POST => admin_panel/user/unblock/id
// GET => admin_panel/get_products_by_category/id
// add products =>  GET admin_panel/add_product
// delete product => DELETE admin_panel/delete_product/id
// PUT admin_panel/edit_product/id


module.exports = router