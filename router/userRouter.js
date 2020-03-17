const express = require('express')
const { userController } = require('../controller')
const { auth } = require('../helper/auth')

const router = express.Router()

router.get('/allparent',userController.getParentData)
router.get('/student',userController.getStudentData)
router.get('/loginStd',userController.studentLogin)
router.post('/loginPrt',userController.parentLogin)
router.get('/parent/:id',userController.getParentImgData)
router.post('/regParent',userController.parentRegister)
router.post('/editParent',userController.parentEdit)
router.post('/keepsign',auth,userController.keepLogin)
router.post('/emailVerification/',auth,userController.emailVerification)
router.post('/resendVerification/',auth,userController.resendVerification)

module.exports = router