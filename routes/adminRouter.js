const express = require('express')

const { adminLoginWithData, AdminLogin, getAllUsers, getSingleUSer, getAddProductPage,addProduct ,addCategory,userBlockAndUnblock,adminPanel,getCategoryProduct, getAllProducts,viewSingleProduct,getCategoryPage,deleteCategory,deleteMultipleCategory,deleteProduct} = require('../controllers/adminController')

const router = express.Router()


// admin pannel =>GET admin_panel (products datas,users datas,order datas, revanew,transactions)
router.get('/', adminPanel)

router.get('/admin_login', AdminLogin)
router.post('/admin_login', adminLoginWithData)

router.get('/users', getAllUsers)

router.get('/user/:id', getSingleUSer)

router.patch('/user/block_and_unblock',userBlockAndUnblock)

router.get('/addCategory', getCategoryPage)
router.delete('/delete_category', deleteCategory)
router.post('/addCategory', addCategory)

router.get('/getProduct', getAllProducts)
router.get('/get_products_by_category/:id', getCategoryProduct)

router.get('/add_product', getAddProductPage)
router.post('/add_product', addProduct)

router.get('/viewProduct/:id',viewSingleProduct)

router.delete('/deletemultipleCategory',deleteMultipleCategory)
router.delete('/deleteProduct',deleteProduct)

// delete product => DELETE admin_panel/delete_product/id
// PUT admin_panel/edit_product/id


module.exports = router