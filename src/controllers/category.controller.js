import logger from "../config/logger.js"
import { sendNotification } from "../helpers/notification.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"
import Category from "../models/category.model.js"
import Reminder from "../models/reminder.model.js"
import User from "../models/user.model.js"
import { dateRangeFilter, ROLES, searchRegex } from "../utils/index.js"

export const addCategory = async (req, res, next) => {
    try {

        const { body, decoded } = req
        const { name, type } = body

        let category_exists = await Category.findOne({ name, type })

        if (category_exists) {
            return res.status(404).json({
                success: false,
                message: "Category with the same name already exists.",
            })
        }

        const category = new Category({
            name,
            type
        })

        await category.save()

        logger.info(`Category submitted by ${decoded.id}`)

        return res.status(201).json({
            success: true,
            message: 'Category submitted successfully.',
            data: category
        })

    } catch (error) {
        logger.error(`Add Category Error: ${error.message}`)
        next(error)
    }
}

export const updateCategory = async (req, res, next) => {
    try {
        const { body, decoded, params } = req
        const { id } = params
        const { name } = body

        const category = await Category.findById(id)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            })
        }

        if (name) {

            const query = { _id: { $ne: id } }

            if (name) {
                query.name = name
            }

            const category_exists = await Category.findOne(query)

            if (category_exists) {
                return res.status(409).json({
                    success: false,
                    message: "Category with the same name already exists.",
                })
            }

        }

        if (name) category.name = name

        await category.save()

        logger.info(`Category ${id} updated by ${decoded.id}`)

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            data: category
        })

    } catch (error) {
        logger.error(`Update Category Error: ${error.message}`)
        next(error)
    }
}

export const toggleStatus = async (req, res, next) => {

    try {

        const { params } = req

        let category = await Category.findById(params.id)

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            })
        }

        category.active = !category.active

        await category.save()

        logger.info(`Category status toggled: ${category.name} → ${category.active ? 'ACTIVE' : 'INACTIVE'}`)

        return res.status(200).json({
            success: true,
            message: `Category's account ${category.active ? 'activated' : 'deactivated'} successfully.`,
            data: category
        })

    } catch (error) {
        logger.error(`Toggle Category Status Error: ${error.message}`)
        next(error)
    }

}

export const getCategories = (async (req, res, next) => {
    try {

        const { query, decoded } = req
        const { search, type, from, to, active } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        let sort = {
            createdAt: -1
        }

        if (search) {
            filter.name = searchRegex(search)
        }

        if (type) {
            filter.type = type
        }

        if (active != null) {
            filter.active = active
        }

        if ((from && from !== "") || (to && to !== "")) {
            filter.createdAt = dateRangeFilter(from, to)
        }

        const categories = await Category.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)

        const total = await Category.countDocuments(filter)

        logger.info(`Categories listing fetched`)

        return res.status(200).json({
            success: true,
            message: 'Categories fetched successfully.',
            ...buildPaginationResponse(categories, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Categories Error: ${error.message}`)
        next(error)
    }
})

// export const getReminderById = async (req, res, next) => {
//     try {

//         const { params } = req
//         const { id } = params

//         const reminder = await Reminder.findById(id)
//             .populate('user', 'name email image')
//             .lean({ virtuals: true })

//         return res.status(200).json({
//             success: true,
//             message: 'Reminder fetched successfully.',
//             data: reminder
//         })

//     } catch (error) {
//         logger.error(`Get Reminder by ID Error: ${error.message}`)
//         next(error)
//     }
// }
