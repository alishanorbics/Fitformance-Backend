import express from 'express'
import { addDispute, getDisputes } from '../controllers/dispute.controller.js'
import { CREATE_DISPUTE_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getDisputes)

router.post('/create', AuthVerifier, validator(CREATE_DISPUTE_VALIDATOR), addDispute)

export default router