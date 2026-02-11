import express from 'express'
import { assignTherapist, changePassword, getHome, getMyProfile, getUserById, getUsers, removeImage, toggleStatus, updateProfile } from '../controllers/user.controller.js'
import { ASSIGN_THERAPIST_VALIDATOR, CHANGE_PASSWORD_VALIDATOR, UPDATE_PROFILE_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/home', AuthVerifier, getHome)

router.get('/get', AuthVerifier, getUsers)

router.get('/get/:id', AuthVerifier, getUserById)

router.get('/my-profile', AuthVerifier, getMyProfile)

router.post('/change-password', AuthVerifier, validator(CHANGE_PASSWORD_VALIDATOR), changePassword)

router.patch('/update', AuthVerifier, upload('user').single('image'), validator(UPDATE_PROFILE_VALIDATOR, { optional: true }), updateProfile)

router.patch('/handle-status/:id', AuthVerifier, toggleStatus)

router.post('/remove-image', AuthVerifier, removeImage)

router.post('/assign-therapist', AuthVerifier, validator(ASSIGN_THERAPIST_VALIDATOR), assignTherapist)

export default router