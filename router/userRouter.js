const express = require('express')
const { userController } = require('../controller')
const { auth } = require('../helper/auth')

const router = express.Router()

router.get('/allparent',userController.getParentData)
router.get('/student',userController.getStudentData)
router.post('/loginStd',userController.studentLogin)
router.post('/studentRegister',userController.studentRegister)
router.get('/studentbyparent/:email',userController.getStudentByEmailOrtu)
router.put('/editstudent/',userController.studentEdit)
router.get('/loginStd',userController.studentLogin)
router.get('/student/:id',userController.getStudentImgData)
router.post('/loginPrt',userController.parentLogin)
router.get('/parent/:id',userController.getParentImgData)
router.post('/regParent',userController.parentRegister)
router.post('/editParent',userController.parentEdit)
router.post('/keepsign',auth,userController.keepLogin)
router.post('/emailVerification/',auth,userController.emailVerification)
router.post('/resendVerification/',auth,userController.resendVerification)

module.exports = router