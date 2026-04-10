import mongoose from "mongoose"
import logger from "../config/logger.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Rehab from '../models/rehab.model.js'
import RehabAssignment from '../models/rehabassignment.model.js'
import { dateRangeFilter, REHAB_TYPES, ROLES, searchRegex } from "../utils/index.js"

export const getRehabs = async (req, res, next) => {
    try {

        const { query } = req
        const { rehab_type, search, from, to } = query
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

        if (search) {
            filter.title = searchRegex(search)
        }

        if ((from && from !== "") || (to && to !== "")) {
            filter.createdAt = dateRangeFilter(from, to)
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

export const getRehabAssignments = async (req, res, next) => {
    try {
        const { query, decoded } = req
        const { search, from, to, rehab_type } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        if (decoded.role === ROLES.THERAPIST) {
            filter.therapist = new mongoose.Types.ObjectId(decoded.id)
        } else if (decoded.role === ROLES.USER) {
            filter.user = new mongoose.Types.ObjectId(decoded.id)
        }

        if ((from && from !== "") || (to && to !== "")) {
            filter.createdAt = dateRangeFilter(from, to)
        }

        let rehab_match = {}

        if (rehab_type === 'protocol') {
            rehab_match.type = { $in: [REHAB_TYPES.DOCUMENT] }
        } else if (rehab_type === 'library') {
            rehab_match.type = { $in: [REHAB_TYPES.VIDEO, REHAB_TYPES.IMAGE] }
        }

        const pipeline = [
            { $match: filter },

            {
                $lookup: {
                    from: "rehabs",
                    localField: "rehab",
                    foreignField: "_id",
                    as: "rehab"
                }
            },
            { $unwind: "$rehab" },

            ...(rehab_type ? [{ $match: { "rehab.type": rehab_match.type } }] : []),

            ...(search && search.trim() !== ""
                ? [{ $match: { "rehab.title": searchRegex(search) } }]
                : []
            ),

            { $sort: { createdAt: -1 } },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        { $project: { _id: 1 } }
                    ],
                    total: [
                        { $count: "count" }
                    ]
                }
            }
        ]

        const result = await RehabAssignment.aggregate(pipeline)
        const ids = result[0].data.map(d => d._id)
        const total = result[0].total[0]?.count || 0

        const assignments = await RehabAssignment.find({ _id: { $in: ids } })
            .sort({ createdAt: -1 })
            .populate('rehab')
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Rehab assignments fetched successfully.',
            ...buildPaginationResponse(assignments, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Rehab Assignments Error: ${error.message}`)
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