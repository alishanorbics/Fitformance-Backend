import express from 'express'
import { addPlan, completePlan, getPlanById, getPlans } from '../controllers/plan.controller.js'
import { CREATE_PLAN_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getPlans)

router.get('/get/:id', AuthVerifier, getPlanById)

router.post('/create', AuthVerifier, validator(CREATE_PLAN_VALIDATOR), addPlan)

router.put('/complete/:id', AuthVerifier, completePlan)

export default router