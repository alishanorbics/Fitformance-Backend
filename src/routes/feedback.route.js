import express from 'express'
import { addFeedback, getFeedbackById, getFeedbacks } from '../controllers/feedback.controller.js'
import { CREATE_FEEDBACK_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier, OptionalAuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getFeedbacks)

router.get('/get/:id', AuthVerifier, getFeedbackById)

router.post('/create', OptionalAuthVerifier, validator(CREATE_FEEDBACK_VALIDATOR), addFeedback)

export default router