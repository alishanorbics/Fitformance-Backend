import express from 'express'
import { getContent, getDashboard, getData } from '../controllers/general.controller.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/get-dashboard', AuthVerifier, getDashboard)

router.get('/get-content', getContent)

router.get('/get-data', getData)

export default router