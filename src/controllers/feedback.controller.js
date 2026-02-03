import logger from "../config/logger.js"
import { sendNotification } from "../helpers/notification.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Feedback from "../models/feedback.model.js"
import { searchRegex } from "../utils/index.js"

export const addFeedback = async (req, res, next) => {
    try {

        const { body, decoded } = req
        const { name, email, subject, message } = body

        const feedback = new Feedback({
            user: decoded?.id || null,
            name,
            email,
            subject,
            message
        })

        await feedback.save()

        logger.info(`Feedback submitted by: ${name} (${email})`)

        if (decoded?.id) {
            await sendNotification({
                title: 'Your Feedback Has Been Received',
                message: `We have successfully received your feedback. Thank you for sharing your thoughts with us!`,
                user_ids: [decoded?.id],
                metadata: { type: 'feedback', id: feedback._id },
                push: false
            })
        }

        await sendNotification({
            title: 'New Feedback Received',
            message: `Feedback submitted by ${name} (${email}).`,
            metadata: { type: 'feedback', id: feedback._id },
            admin: true
        })

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully.',
            data: feedback
        })

    } catch (error) {
        logger.error(`Add Feedback Error: ${error.message}`)
        next(error)
    }
}

export const getFeedbacks = (async (req, res, next) => {
    try {

        const { query } = req
        const { search } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        let sort = {
            createdAt: -1
        }

        if (search) {
            filter.name = searchRegex(search)
        }

        const feedbacks = await Feedback.find(filter)
            .populate({ path: "user", select: "name email picture" })
            .sort(sort)
            .skip(skip)
            .limit(limit)

        const total = await Feedback.countDocuments(filter)

        logger.info(`Feedbacks listing fetched`)

        return res.status(200).json({
            success: true,
            message: 'Feedbacks fetched successfully.',
            ...buildPaginationResponse(feedbacks, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Feedbacks Error: ${error.message}`)
        next(error)
    }
})

export const getFeedbackById = async (req, res, next) => {
    try {

        const { params } = req
        const { id } = params

        const feedback = await Feedback.findById(id)
            .populate('user', 'name email image')
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Feedback fetched successfully.',
            data: feedback
        })

    } catch (error) {
        logger.error(`Get Feedback by ID Error: ${error.message}`)
        next(error)
    }
}
