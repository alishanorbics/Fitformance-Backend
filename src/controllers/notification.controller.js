import logger from "../config/logger.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination"
import Notification from '../models/notification.model.js'

export const getNotifications = async (req, res, next) => {
    
    try {

        const { query, decoded } = req
        const { read } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {
            'recipients.user': decoded.id,
            active: true
        }

        if (read === 'true') {
            filter['recipients.read'] = true
        } else if (read === 'false') {
            filter['recipients.read'] = false
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Notification.countDocuments(filter)

        logger.info(`Notifications listing fetched for user ${decoded.id}`)

        return res.status(200).json({
            success: true,
            message: 'Notifications fetched successfully.',
            ...buildPaginationResponse(notifications, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Notifications Error: ${error.message}`)
        next(error)
    }

}