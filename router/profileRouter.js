const express = require('express')
const { auth } = require('../helper/auth')
const {profileController} = require('../controller')

const router = express.Router()

router.put('/editPP/:id',auth,profileController.editProfileImage)
router.put('/editStudentPP/:id',auth,profileController.editStudentProfileImage)

module.exports=router