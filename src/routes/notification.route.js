import express from 'express'
import { getNotifications } from '../controllers/notification.controller.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/get', AuthVerifier, getNotifications)

export default router