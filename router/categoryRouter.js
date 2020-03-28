const express = require('express')
const { categoryController } = require('../controller')

const router = express.Router()

router.get('/getAllCategory',categoryController.getAllCategory)
router.get('/getallleaf', categoryController.getAllLeafCategory)
router.post('/addCategory', categoryController.addCategory)
router.delete('/deleteCategory/:id', categoryController.deleteCategory)
router.put('/editCategory/:id', categoryController.editCategory)

router.get('/getallProductCat', categoryController.getAllProductCat)
router.get('/getAllProductLeafCat', categoryController.getAllProductLeafCat)
router.post('/addProductCat', categoryController.addProductCat)
router.delete('/deleteProductCat/:id', categoryController.deleteProductCat)
router.put('/editProductCat/:id', categoryController.editProductCat)

router.get('/getProductCatbyCategoryID/:id', categoryController.getProductCatByCategory)



module.exports = router