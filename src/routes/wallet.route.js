import express from 'express'
import { addFunds, getBalance, getTransactions, withdrawFunds } from '../controllers/wallet.controller.js'
import { ADD_FUNDS_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.post('/add-funds', AuthVerifier, validator(ADD_FUNDS_VALIDATOR), addFunds)

router.post('/withdraw-funds', AuthVerifier, validator(ADD_FUNDS_VALIDATOR), withdrawFunds)

router.get('/balance', AuthVerifier, getBalance)

router.get('/transactions', AuthVerifier, getTransactions)

export default router