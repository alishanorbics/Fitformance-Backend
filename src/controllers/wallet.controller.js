import logger from '../config/logger.js'
import { buildPaginationResponse, getPagination } from '../helpers/pagination.js'
import Wallet from '../models/wallet.model.js'
import Transaction from '../models/transaction.model.js'
import { searchRegex } from '../utils/index.js'

export const getBalance = async (req, res, next) => {
    try {

        const { decoded } = req

        const wallet = await Wallet.findOne({ user: decoded.id }).lean({ virtuals: true })

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found.'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Wallet balance fetched successfully.',
            data: {
                balance: wallet.balance,
                formatted_balance: wallet.formatted_balance
            }
        })

    } catch (error) {
        logger.error(`Get Balance Error: ${error.message}`)
        next(error)
    }

}

export const getTransactions = async (req, res, next) => {
    try {

        const { decoded, query } = req
        const { skip, limit, page, page_size } = getPagination(query)
        const { search, type, status } = query

        const wallet = await Wallet.findOne({ user: decoded.id }).select('_id').lean()

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found.'
            })
        }

        const filter = {
            wallet: wallet._id
        }

        if (search) filter.description = searchRegex(search)
        if (type) filter.type = type
        if (status) filter.status = status

        const total = await Transaction.countDocuments(filter)

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Transactions fetched successfully.',
            ...buildPaginationResponse(transactions, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Transactions Error: ${error.message}`)
        next(error)
    }
}