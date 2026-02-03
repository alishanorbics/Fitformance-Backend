import express from 'express'
import { addPackage, getPackages, subscribePackage } from '../controllers/package.controller.js'
import { CREATE_PACKAGE_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getPackages)

router.post('/create', AuthVerifier, validator(CREATE_PACKAGE_VALIDATOR), addPackage)

router.post('/subscribe/:id', AuthVerifier, subscribePackage)

export default router