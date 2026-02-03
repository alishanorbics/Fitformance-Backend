import logger from "../config/logger.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Rehab from '../models/rehab.model.js'
import { REHAB_TYPES } from "../utils/index.js"

export const getRehabs = async (req, res, next) => {
    try {
        const { query } = req
        const { rehab_type } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        if (rehab_type) {
            if (rehab_type === 'protocol') {
                filter.type = { $in: [REHAB_TYPES.DOCUMENT] }
            } else if (rehab_type === 'library') {
                filter.type = { $in: [REHAB_TYPES.VIDEO, REHAB_TYPES.IMAGE] }
            } else if (rehab_type === 'for_you') {
                filter.type = rehab_type
            }
        }

        const rehabs = await Rehab.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Rehab.countDocuments(filter)

        logger.info(`Rehabs listing fetched`)

        return res.status(200).json({
            success: true,
            message: 'Rehabs fetched successfully.',
            ...buildPaginationResponse(rehabs, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Rehabs Error: ${error.message}`)
        next(error)
    }
}

export const getRehabById = async (req, res, next) => {
    try {

        const { params } = req
        const { id } = params

        const rehab = await Rehab.findById(id)

        return res.status(200).json({
            success: true,
            message: 'Rehab fetched successfully.',
            data: rehab
        })

    } catch (error) {
        logger.error(`Get Rehab by ID Error: ${error.message}`)
        next(error)
    }
}

export const addRehab = async (req, res, next) => {

    try {
        const { body, decoded, file } = req
        const { title, description, type, is_premium } = body

        const rehab = new Rehab({
            title,
            description: description.trim(),
            type,
            file: file?.path || null,
            is_premium: is_premium || false,
        })

        await rehab.save()

        logger.info(`Rehab created by user ${decoded.id}`)

        return res.status(201).json({
            success: true,
            message: 'Rehab created successfully.',
            data: rehab,
        })

    } catch (error) {
        next(error)
    }

}