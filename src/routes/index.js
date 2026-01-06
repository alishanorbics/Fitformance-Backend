import express from "express";

const router = express.Router()

import auth_routes from './authentication.route.js'
import user_routes from './user.route.js'
import bet_routes from './bet.route.js'
import wallet_routes from './wallet.route.js'
import feedback_routes from './feedback.route.js'
import general_routes from './general.route.js'

router.use('/auth', auth_routes)
router.use('/user', user_routes)
router.use('/bet', bet_routes)
router.use('/wallet', wallet_routes)
router.use('/feedback', feedback_routes)
router.use('/general', general_routes)

export default router