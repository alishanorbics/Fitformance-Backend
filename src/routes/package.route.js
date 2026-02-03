import express from 'express'
import { addPackage, getPackages, getPaymentLogs, subscribePackage } from '../controllers/package.controller.js'
import { CREATE_PACKAGE_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getPackages)

router.get('/payment-logs', AuthVerifier, getPaymentLogs)

router.post('/create', AuthVerifier, validator(CREATE_PACKAGE_VALIDATOR), addPackage)

router.post('/subscribe/:id', AuthVerifier, subscribePackage)

export default router