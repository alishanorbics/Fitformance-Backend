import express from 'express'
import { getContent, getDashboard } from '../controllers/general.controller.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/get-dashboard', AuthVerifier, getDashboard)

router.get('/get-content', getContent)

export default router