const express = require('express')

const { adminLoginWithData, AdminLogin, getAllUsers, getSingleUSer, getAddProductPage, addProduct, addCategory, userBlockAndUnblock, adminPanel, getCategoryProduct, getAllProducts, viewSingleProduct, getCategoryPage, deleteCategory, deleteMultipleCategory, deleteProduct, getOrders, cancelOrder, changeOrderStatus, addCoupon, addCouponCode , deleteCoupon, getchartData } = require('../controllers/adminController')

const router = express.Router()


// admin pannel =>GET admin_panel (products datas,users datas,order datas, revanew,transactions)
router.get('/', adminPanel)

router.get('/admin_login', AdminLogin)

router.post('/admin_login', adminLoginWithData)

router.get('/users', getAllUsers)

router.get('/user/:id', getSingleUSer)

router.patch('/user/block_and_unblock', userBlockAndUnblock)

router.get('/addCategory', getCategoryPage)

router.delete('/delete_category', deleteCategory)

router.post('/addCategory', addCategory)

router.get('/getProduct', getAllProducts)

router.get('/get_products_by_category/:id', getCategoryProduct)

router.get('/add_product', getAddProductPage)

router.post('/add_product', addProduct)

router.get('/viewProduct/:id', viewSingleProduct)

router.delete('/deletemultipleCategory', deleteMultipleCategory)

router.delete('/deleteProduct', deleteProduct)

router.get('/orders', getOrders)

router.delete('/canceleOrder', cancelOrder)

router.post('/changeOrderstatus', changeOrderStatus)

router.get('/addCoupon', addCoupon)

router.post('/addcoupon', addCouponCode)

router.delete('/delCoupon', deleteCoupon)

router.get('/getChardData', getchartData)

module.exports = router