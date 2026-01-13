import logger from "../config/logger.js"
import Transaction from "../models/transaction.model.js"

export const getTransactions = async (req, res, next) => {

    try {

        let filters = {}
        let sort = { createdAt: - 1 }

        const transactions = await Transaction.find(filters)
            .sort(sort)
            .populate({ path: "wallet", select: "user", populate: { path: "user", select: "name email image image_url" } })
            .lean({ virtuals: true })

        logger.info(`Transaction listing fetched`)

        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully.",
            data: transactions
        })

    } catch (error) {
        logger.error(`Get Transactions Error: ${error.message}`)
        next(error)
    }
}