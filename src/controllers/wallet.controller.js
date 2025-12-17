import mongoose from 'mongoose'
import logger from '../config/logger.js'
import { buildPaginationResponse, getPagination } from '../helpers/pagination.js'
import { addFundsCheckoutSession, createPayout, createStripeAccount } from '../helpers/stripe.js'
import Transaction from '../models/transaction.model.js'
import Wallet from '../models/wallet.model.js'
import { searchRegex, TRANSACTION_STATUS, TRANSACTION_TYPES } from '../utils/index.js'

export const addFunds = async (req, res, next) => {
    try {

        const { decoded, body } = req
        const { amount } = body

        const data = await addFundsCheckoutSession(amount, decoded.id)

        return res.status(200).json({
            success: true,
            message: 'Stripe checkout session created successfully.',
            data
        })

    } catch (error) {
        logger.error(`Add Funds Error: ${error.message}`)
        next(error)
    }
}

export const withdrawFunds = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const { decoded, body } = req
        const { amount } = body

        const wallet = await Wallet.findOne({ user: decoded.id }).session(session)

        if (!wallet) {
            await session.abortTransaction()
            return res.status(404).json({
                success: false,
                message: 'Wallet not found.'
            })
        }

        if (!wallet.stripe_onboarding_complete || !wallet.stripe_account_id) {

            const data = await createStripeAccount(wallet.user)
            await session.commitTransaction()

            return res.status(200).json({
                success: true,
                message: 'Account onboarding link has been generated successfully.',
                data
            })

        }

        if (wallet.balance < amount) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: 'Insufficient funds.'
            })
        }

        wallet.balance -= amount
        await wallet.save({ session })

        const payout = await createPayout(wallet.stripe_account_id, amount)

        const transaction = new Transaction({
            wallet: wallet._id,
            type: TRANSACTION_TYPES.WITHDRAW,
            amount,
            external_reference: payout,
            description: 'Wallet withdrawal to bank account',
            balance_after: wallet.balance,
            status: TRANSACTION_STATUS.PENDING
        })

        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            success: true,
            message: 'Withdraw request has been initiated successfully.'
        })

    } catch (error) {

        await session.abortTransaction()
        session.endSession()

        logger.error(`Withdraw Funds Error: ${error.message}`)
        next(error)

    }
}

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