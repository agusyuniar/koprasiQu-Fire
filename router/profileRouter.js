const express = require('express')
const { auth } = require('../helper/auth')
const {profileController} = require('../controller')

const router = express.Router()

router.put('/editPP/:id',auth,profileController.editProfileImage)

module.exports=router