import express from 'express'
import { addPlan } from '../controllers/plan.controller.js'
import { CREATE_PLAN_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.post('/create', AuthVerifier, validator(CREATE_PLAN_VALIDATOR), addPlan)

export default router