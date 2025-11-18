import express from 'express'
import { changePassword, getMyProfile } from '../controllers/user.controller.js'
import { CHANGE_PASSWORD_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/my-profile', AuthVerifier, getMyProfile)

router.post('/change-password', AuthVerifier, validator(CHANGE_PASSWORD_VALIDATOR), changePassword)

router.patch('/update', AuthVerifier, changePassword)

export default router