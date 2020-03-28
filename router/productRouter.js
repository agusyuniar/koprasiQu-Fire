const express = require('express')
const { productController } = require('../controller')

const router = express.Router()

router.get('/getProduct',productController.getAllProduct)
router.get('/searchProductbyName/:search',productController.searchProductbyName)
router.get('/getProductByID/:id',productController.getProductById)
router.put('/editImageID/:id',productController.editImageById)
router.delete('/deleteImageID/:id',productController.deleteImageById)
router.post('/addProduct',productController.addProduct)
router.post('/addProductImage',productController.addProductImage)
router.put('/editProduct',productController.editProduct)
router.delete('/deleteProduct/:id',productController.deleteProduct)
router.post('/addParentCart',productController.addToParentCart)
router.get('/cartByParent/:id',productController.getCartbyParent)
router.delete('/deleteCartId/:id',productController.deleteCartbyId)
router.put('/chekcoutCart',productController.cartCheckOut)
router.put('/checkoutOrder',productController.makeOrderCheckout)
router.get('/gettransaction/:id',productController.getTransaction)

module.exports = router