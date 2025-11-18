import express from 'express'
import { getBalance, getTransactions } from '../controllers/wallet.controller.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/balance', AuthVerifier, getBalance)

router.get('/transactions', AuthVerifier, getTransactions)

export default router