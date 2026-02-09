import express from 'express'
import { addReminder, getReminderById, getReminders } from '../controllers/reminder.controller.js'
import { CREATE_REMINDER_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getReminders)

router.get('/get/:id', AuthVerifier, getReminderById)

router.post('/create', AuthVerifier, validator(CREATE_REMINDER_VALIDATOR), addReminder)

export default router