import express from 'express'
import { addBet, getBetById, getBets, getInvitedBets, participateInBet, setWinner } from '../controllers/bet.controller.js'
import { CREATE_BET_VALIDATOR, PARTICIPATE_BET_VALIDATOR, SET_WINNER_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.post('/create', AuthVerifier, upload('bet').single('image'), validator(CREATE_BET_VALIDATOR), addBet)

router.post('/participate/:id', AuthVerifier, validator(PARTICIPATE_BET_VALIDATOR), participateInBet)

router.post('/winner/:id', AuthVerifier, validator(SET_WINNER_VALIDATOR), setWinner)

router.get('/get', AuthVerifier, getBets)

router.get('/get/:id', AuthVerifier, getBetById)

router.get('/invites', AuthVerifier, getInvitedBets)

export default router