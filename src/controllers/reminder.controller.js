import logger from "../config/logger.js"
import { sendNotification } from "../helpers/notification.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Reminder from "../models/reminder.model.js"
import User from "../models/user.model.js"
import { ROLES, searchRegex } from "../utils/index.js"

export const addReminder = async (req, res, next) => {
    try {

        const { body, decoded } = req
        const { user, title, message } = body

        let user_exists = await User.findOne({ _id: user, therapist: decoded.id, role: ROLES.USER })

        if (!user_exists) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            })
        }

        const reminder = new Reminder({
            user,
            therapist: decoded.id,
            title,
            message
        })

        await reminder.save()

        logger.info(`Reminder submitted by ${decoded.id}`)

        await sendNotification({
            title,
            message,
            metadata: { type: 'reminder', id: reminder._id },
            user_ids: [user]
        })

        return res.status(201).json({
            success: true,
            message: 'Reminder submitted successfully.',
            data: reminder
        })

    } catch (error) {
        logger.error(`Add Reminder Error: ${error.message}`)
        next(error)
    }
}

export const getReminders = (async (req, res, next) => {
    try {

        const { query, decoded } = req
        const { search } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        let sort = {
            createdAt: -1
        }

        if (decoded.role === ROLES.THERAPIST) {
            filter.therapist = decoded.id
        }

        if (search) {
            filter.name = searchRegex(search)
        }

        const reminders = await Reminder.find(filter)
            .populate({ path: "user", select: "name email picture" })
            .sort(sort)
            .skip(skip)
            .limit(limit)

        const total = await Reminder.countDocuments(filter)

        logger.info(`Reminders listing fetched`)

        return res.status(200).json({
            success: true,
            message: 'Reminders fetched successfully.',
            ...buildPaginationResponse(reminders, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Reminders Error: ${error.message}`)
        next(error)
    }
})

export const getReminderById = async (req, res, next) => {
    try {

        const { params } = req
        const { id } = params

        const reminder = await Reminder.findById(id)
            .populate('user', 'name email image')
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Reminder fetched successfully.',
            data: reminder
        })

    } catch (error) {
        logger.error(`Get Reminder by ID Error: ${error.message}`)
        next(error)
    }
}
