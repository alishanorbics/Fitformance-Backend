import express from "express";

const router = express.Router()

import auth_routes from './authentication.route.js'
import user_routes from './user.route.js'
import rehab_routes from './rehab.route.js'
import package_routes from './package.route.js'
import feedback_routes from './feedback.route.js'
import general_routes from './general.route.js'
import notification_routes from './notification.route.js'

router.use('/auth', auth_routes)
router.use('/user', user_routes)
router.use('/rehab', rehab_routes)
router.use('/package', package_routes)
router.use('/notification', notification_routes)
router.use('/feedback', feedback_routes)
router.use('/general', general_routes)

export default router