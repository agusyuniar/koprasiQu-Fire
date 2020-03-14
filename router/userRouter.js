const express = require('express')
const { userController } = require('../controller')
const { auth } = require('../helper/auth')

const router = express.Router()

router.post('/parent',userController.getParentData)
router.get('/parent/:id',userController.getParentImgData)
router.get('/student',userController.getStudentData)
router.get('/loginStd',userController.studentLogin)
router.post('/loginPrt',userController.parentLogin)
router.post('/regParent',userController.parentRegister)
router.post('/keepsign',auth,userController.keepLogin)
router.post('/emailVerification/',auth,userController.emailVerification)
router.post('/resendVerification/',auth,userController.resendVerification)

module.exports = router