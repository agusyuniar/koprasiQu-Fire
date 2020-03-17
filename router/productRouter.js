const express = require('express')
const { productController } = require('../controller')

const router = express.Router()

router.get('/getProduct',productController.getAllProduct)
router.put('/editImageID/:id',productController.editImageById)
router.delete('/deleteImageID/:id',productController.deleteImageById)
router.post('/addProduct',productController.addProduct)
router.post('/addProductImage',productController.addProductImage)
router.put('/editProduct/:id',productController.editProduct)
router.delete('/deleteProduct/:id',productController.deleteProduct)

module.exports = router