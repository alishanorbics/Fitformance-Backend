import logger from "../config/logger.js"
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

export const getFeedbacks = (async (req, res) => {
    try {

        const { query } = req
        const { search } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        let sort = {
            createdAt: -1
        }

        let projection = {}

        if (search) {
            filter.name = searchRegex(search)
        }

        const feedbacks = await Feedback.find(filter, projection, options).populate({ path: "user", select: "name email picture" }).sort(sort).skip(skip).limit(limit)
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

const getFeedbackById = (async (req, res) => {
    try {

        let id = req.params.id

        let feedback = await Feedback.findById(id).populate({ path: "user", select: "role" })

        return res.status(200).send({
            success: true,
            data: feedback
        })

    } catch (e) {
        console.log("Error Message :: ", e)
        res.status(400).send({
            success: false,
            message: e.message
        })
    }
})
