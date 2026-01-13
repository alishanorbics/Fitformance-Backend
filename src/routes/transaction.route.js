import express from 'express'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import { getTransactions } from '../controllers/transaction.controller.js'

const router = express.Router()

router.get('/get', AuthVerifier, getTransactions)

export default router