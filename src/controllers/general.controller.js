import fs from 'fs/promises'
import path from 'path'
import logger from '../config/logger.js'
import Dispute from '../models/dispute.model.js'
import User from '../models/user.model.js'
import { DISPUTE_STATUS, ROLES } from '../utils/index.js'

export const getDashboard = async (req, res, next) => {
    try {

        const users = await User.countDocuments({ role: ROLES.USER })
        const active_users = await User.countDocuments({ role: ROLES.USER, active: true })
        const unresolved_disputes = await Dispute.countDocuments({ status: DISPUTE_STATUS.PENDING })

        const data = {
            users,
            active_users,
            unresolved_disputes
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

        const uploads_dir = path.join(process.cwd(), 'uploads')

        const files = {
            about_us: path.join(uploads_dir, 'about-us.html'),
            privacy_policy: path.join(uploads_dir, 'privacy-policy.html'),
            terms: path.join(uploads_dir, 'terms.html'),
        }

        const data = {}

        for (const [key, file_path] of Object.entries(files)) {
            try {
                const content = await fs.readFile(file_path, 'utf-8')
                data[key] = content
            } catch (err) {
                logger.error(`Error reading ${key}: ${err.message}`)
                data[key] = null
            }
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
