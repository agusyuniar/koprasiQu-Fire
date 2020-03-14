const express = require('express')
const { productController } = require('../controller')

const router = express.Router()

router.get('/getProduct',productController.getAllProduct)
router.post('/addProduct',productController.addProduct)
router.put('/editProduct/:id',productController.editProduct)
router.delete('/deleteProduct/:id',productController.deleteProduct)

module.exports = router