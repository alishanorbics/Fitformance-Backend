import logger from "../config/logger.js"
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import { ROLES } from "../utils/index.js"

export const sendNotification = async ({ title, message, user_ids = [], metadata = null, admin = false }) => {

    if (!title || !message) {
        throw new Error('Invalid parameters for send notification.')
    }

    if (admin) {
        const admins = await User.find({ role: ROLES.ADMIN, active: true }).select('_id')
        user_ids = admins.map(item => item._id)
    }

    const recipients = user_ids.map(item => ({
        user: item,
        read: false
    }))

    if (!recipients.length) {
        logger.warn('No recipients found for notification:', title)
        return null
    }

    const notification = new Notification({
        title,
        message,
        recipients,
        metadata
    })

    await notification.save()

    logger.info(`Notification sent to ${user_ids.length} user(s)`)

    return notification

}