const { Router } = require('express')
const express = require('express')
const { login } = require('../controllers/adminController')
const router = express.Router()


// signin POST
router.get('/admin_login', login)

// admin pannel =>GET admin_panel (products datas,users datas,order datas, revanew,transactions)
// view users =>GET admin_panel/user
// POST => admin_panel/user/block/id
// POST => admin_panel/user/unblock/id
// GET => admin_panel/get_products_by_category/id
// add products =>  GET admin_panel/add_product
// delete product => DELETE admin_panel/delete_product/id
// PUT admin_panel/edit_product/id


module.exports = Router