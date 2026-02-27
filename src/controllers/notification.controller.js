import mongoose from "mongoose"
import logger from "../config/logger.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Notification from '../models/notification.model.js'

export const getNotifications = async (req, res, next) => {

    try {

        const { query, decoded } = req
        const { read } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {
            'recipients.user': new mongoose.Types.ObjectId(decoded.id)
        }

        if (read === 'true') {
            filter['recipients.read'] = true
        } else if (read === 'false') {
            filter['recipients.read'] = false
        }

        const notifications = await Notification.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $addFields: {
                    recipient: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$recipients',
                                    as: 'self',
                                    cond: { $eq: ['$$self.user', new mongoose.Types.ObjectId(decoded.id)] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    read: '$recipient.read'
                }
            },
            { $project: { recipient: 0 } }
        ])

        const total = await Notification.countDocuments(filter)

        await Notification.updateMany(
            { _id: { $in: notifications.map(item => item._id) }, 'recipients.user': new mongoose.Types.ObjectId(decoded.id) },
            {
                $set: {
                    'recipients.$[elem].read': true,
                    'recipients.$[elem].read_at': new Date()
                }
            },
            {
                arrayFilters: [{ 'elem.user': new mongoose.Types.ObjectId(decoded.id) }]
            }
        )

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