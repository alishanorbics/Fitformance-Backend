import mongoose from "mongoose"
import logger from "../config/logger.js"
import Bet from '../models/bet.model.js'
import Dispute from '../models/dispute.model.js'
import { BET_STATUS } from "../utils/index.js"
import { buildPaginationResponse, getPagination } from "../helpers/pagination.js"

export const getDisputes = async (req, res, next) => {
    try {
        const { query } = req
        const { status } = query
        const { skip, limit, page, page_size } = getPagination(query)

        let filter = {}

        if (status) {
            filter.status = status
        }

        const disputes = await Dispute.find(filter)
            .populate({ path: 'user', select: 'name email picture' })
            .populate({ path: 'bet', select: 'title question amount status image' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await Dispute.countDocuments(filter)

        logger.info(`Disputes listing fetched`)

        return res.status(200).json({
            success: true,
            message: 'Disputes fetched successfully.',
            ...buildPaginationResponse(disputes, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Disputes Error: ${error.message}`)
        next(error)
    }
}

export const addDispute = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { body, decoded } = req
        const { bet: bet_id, reason } = body

        const bet = await Bet.findById(bet_id).session(session)

        if (!bet) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ success: false, message: 'Bet not found.' })
        }

        if (bet.status !== BET_STATUS.RESOLVED) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ success: false, message: 'Disputes can only be raised for resolved bets.' })
        }

        const existing_dispute = await Dispute.findOne({ bet: bet_id, user: decoded.id }).session(session)

        if (existing_dispute) {

            await session.abortTransaction()
            session.endSession()
            return res.status(409).json({ success: false, message: 'You have already raised a dispute for this bet.' })

        }

        const dispute = new Dispute({
            bet: bet_id,
            user: decoded.id,
            reason: reason.trim(),
        })

        await dispute.save({ session })

        await session.commitTransaction()
        session.endSession()

        logger.info(`Dispute created by user ${decoded.id} for bet ${bet_id}`)

        return res.status(201).json({
            success: true,
            message: 'Dispute submitted successfully.',
            data: dispute,
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        next(error)
    }
}