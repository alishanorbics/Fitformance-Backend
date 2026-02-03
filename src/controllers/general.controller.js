import logger from '../config/logger.js'
import User from '../models/user.model.js'
import { ROLES } from '../utils/index.js'

export const getDashboard = async (req, res, next) => {
    try {

        const users = await User.countDocuments({ role: ROLES.USER })
        const active_users = await User.countDocuments({ role: ROLES.USER, active: true })

        const data = {
            users,
            active_users,
        }

        return res.status(200).json({
            success: true,
            data
        })

    } catch (error) {
        logger.error(`Get Dashboard Error: ${error.message}`)
        next(error)
    }
}

export const getContent = async (req, res, next) => {
    try {

        const base_url = `${req.protocol}://${req.get('host')}/uploads`

        const files = {
            about_us: 'about-us.html',
            privacy_policy: 'privacy-policy.html',
            terms: 'terms.html',
        }

        const data = {}

        for (const [key, filename] of Object.entries(files)) {
            data[key] = `${base_url}/${filename}`
        }

        return res.status(200).json({
            success: true,
            data
        })

    } catch (error) {
        logger.error(`Get Content Error: ${error.message}`)
        next(error)
    }
}
