import Transaction from "../models/transaction.model"

export const getTransactions = async (req, res, next) => {

    try {

        let filters = {}
        let sort = { createdAt: - 1 }

        const users = await Transaction.find(filters)
            .sort(sort)
            .lean({ virtuals: true })

        logger.info(`Transaction listing fetched`)

        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully.",
            data: users
        })

    } catch (error) {
        logger.error(`Get Transactions Error: ${error.message}`)
        next(error)
    }
}