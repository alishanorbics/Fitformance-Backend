import logger from '../config/logger.js'
import User from '../models/user.model.js'
import { PROFILE_STATUS, ROLES } from '../utils/index.js'

export const getDashboard = async (req, res, next) => {
    try {

        const users = await User.countDocuments({ role: ROLES.USER, active: true, status: PROFILE_STATUS.APPROVED })
        const therapists = await User.countDocuments({ role: ROLES.THERAPIST, active: true, status: PROFILE_STATUS.APPROVED })
        const user_requests = await User.countDocuments({ role: ROLES.USER, active: true, status: PROFILE_STATUS.PENDING })
        const therapist_requests = await User.countDocuments({ role: ROLES.THERAPIST, active: true, status: PROFILE_STATUS.PENDING })

        const data = {
            users,
            therapists,
            user_requests,
            therapist_requests
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

        const base_url = `${req.protocol}s://${req.get('host')}/uploads`

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
