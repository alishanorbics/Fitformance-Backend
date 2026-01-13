import mongoose from 'mongoose'
import logger from '../config/logger.js'
import { removeFiles } from '../helpers/folder.js'
import { buildPaginationResponse, getPagination } from '../helpers/pagination.js'
import Bet from '../models/bet.model.js'
import Transaction from '../models/transaction.model.js'
import User from '../models/user.model.js'
import Wallet from '../models/wallet.model.js'
import { BET_PARTICIPATION_STATUS, BET_PROCCESS_STATUS, BET_STATUS, ROLES, searchRegex, TRANSACTION_TYPES } from '../utils/index.js'

export const addBet = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const { body, decoded, file } = req
        const {
            title,
            description,
            amount,
            question,
            options,
            invited_participants,
            date,
            start_time,
            end_time
        } = body

        if (!file || !file.path) {
            return res.status(400).json({ success: false, message: 'Image is required.' })
        }

        const exists = await Bet.findOne({ user: decoded.id, title: searchRegex(title, true) }).session(session)

        if (exists) {
            await session.abortTransaction()
            session.endSession()
            removeFiles(file.path)
            return res.status(409).json({ success: false, message: 'A bet with this title already exists.' })
        }

        const participant_ids = [...new Set(invited_participants.map(item => item.user))]

        if (participant_ids.includes(decoded.id.toString())) {
            await session.abortTransaction()
            session.endSession()
            removeFiles(file.path)
            return res.status(400).json({ success: false, message: 'You cannot invite yourself as a participant.' })
        }

        const existing_users = await User.find({ _id: { $in: participant_ids } }).select('_id').session(session)

        if (existing_users.length !== participant_ids.length) {
            await session.abortTransaction()
            session.endSession()
            removeFiles(file.path)
            return res.status(400).json({ success: false, message: 'Some participants do not exist.' })
        }

        const wallet = await Wallet.findOne({ user: decoded.id }).session(session)

        if (!wallet) {
            await session.abortTransaction()
            session.endSession()
            removeFiles(file.path)
            return res.status(404).json({ success: false, message: 'Wallet not found.' })
        }

        if (wallet.balance < Number(amount)) {
            await session.abortTransaction()
            session.endSession()
            removeFiles(file.path)
            return res.status(400).json({ success: false, message: 'Insufficient funds.' })
        }

        const updated_invited_participants = [...invited_participants, { user: decoded.id }]
        const updated_start_time = new Date(`${date}T${start_time}:00`)
        const updated_end_time = new Date(`${date}T${end_time}:00`)

        const bet = new Bet({
            user: decoded.id,
            title,
            description,
            amount: Number(amount),
            question,
            options,
            invited_participants: updated_invited_participants,
            date,
            start_time: updated_start_time,
            end_time: updated_end_time,
            image: file.path
        })

        await bet.save({ session })

        await session.commitTransaction()
        session.endSession()

        logger.info(`Bet created successfully by ${decoded.id}`)

        return res.status(201).json({ success: true, message: 'Bet created successfully.', data: bet })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        if (req.file?.path) removeFiles(req.file.path)
        next(error)
    }
}

export const participateInBet = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const { decoded, body, params } = req
        const { option_id } = body
        const { id } = params

        if (!option_id) {
            return res.status(400).json({ success: false, message: 'Option ID is required.' })
        }

        const bet = await Bet.findById(id).session(session)
        if (!bet) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ success: false, message: 'Bet not found.' })
        }

        const is_invited = bet.invited_participants.some(p => p.user.toString() === decoded.id.toString())
        if (!is_invited) {
            await session.abortTransaction()
            session.endSession()
            return res.status(403).json({ success: false, message: 'You are not invited to this bet.' })
        }

        if (bet.status !== BET_STATUS.PENDING) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({
                success: false,
                message: `Cannot participate. Bet is ${bet.status}.`
            })
        }

        switch (bet.current_status) {
            case BET_PROCCESS_STATUS.UPCOMING:
                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({
                    success: false,
                    message: 'This bet has not started yet. You can participate once it is open.'
                })
            case BET_PROCCESS_STATUS.CLOSED:
                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({
                    success: false,
                    message: 'This bet has already ended. Participation is no longer allowed.'
                })
            case BET_PROCCESS_STATUS.OPEN:
                break
            default:
                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({
                    success: false,
                    message: `You cannot participate in this bet at this time. Current status: "${bet.current_status}".`
                })
        }

        const already_answered = bet.participants.some(p => p.user.toString() === decoded.id.toString())
        if (already_answered) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ success: false, message: 'You have already answered this bet.' })
        }

        const valid_option = bet.options.some(item => item._id.toString() === option_id.toString())
        if (!valid_option) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ success: false, message: 'Invalid option selected.' })
        }

        const wallet = await Wallet.findOne({ user: decoded.id }).session(session)
        if (!wallet) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ success: false, message: 'Wallet not found.' })
        }

        if (wallet.balance < bet.amount) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ success: false, message: 'Insufficient funds.' })
        }

        wallet.balance -= bet.amount
        await wallet.save({ session })

        const transaction = new Transaction({
            wallet: wallet._id,
            type: TRANSACTION_TYPES.BET,
            amount: bet.amount,
            reference: bet._id,
            description: `Bet participation: ${bet.title}`,
            balance_after: wallet.balance,
        })
        await transaction.save({ session })

        bet.participants.push({
            user: decoded.id,
            option_id,
        })

        bet.invited_participants = bet.invited_participants.map(item => {
            if (item.user.toString() === decoded.id) {
                return { ...item.toObject(), status: BET_PARTICIPATION_STATUS.CONFIRMED }
            }
            return item
        })

        bet.total_pot += bet.amount

        await bet.save({ session })

        await session.commitTransaction()
        session.endSession()

        logger.info(`User ${decoded.id} participated in bet ${bet.id}`)

        return res.status(200).json({
            success: true,
            message: 'Bet answered successfully.'
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        logger.error(`Answer Bet Error: ${error.message}`)
        next(error)
    }
}

export const setWinner = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const { params, body } = req
        const { id } = params
        const { correct_option } = body

        const bet = await Bet.findById(id).session(session)
        if (!bet) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ success: false, message: 'Bet not found.' })
        }

        if (bet.status !== BET_STATUS.PENDING) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({
                success: false,
                message: `Cannot set winner. Bet is ${bet.status}.`
            })
        }

        if (bet.current_status !== BET_PROCCESS_STATUS.CLOSED) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({
                success: false,
                message: 'Bet is not closed yet. Winner can be set only after the bet ends.'
            })
        }

        const option_exists = bet.options.some(item => item._id.toString() === correct_option.toString())
        if (!option_exists) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ success: false, message: 'Invalid winning option.' })
        }

        bet.correct_option = correct_option

        const winners = bet.participants.filter(item => item.option_id.toString() === correct_option.toString())

        if (winners.length === 0) {

            bet.participants = bet.participants.map(item => ({
                ...item.toObject(),
                is_winner: false,
                reward: 0
            }))

            bet.status = BET_STATUS.RESOLVED

            await bet.save({ session })
            await session.commitTransaction()
            session.endSession()

            return res.status(200).json({
                success: true,
                message: 'Winner set, but no participants selected the correct option.',
                data: bet
            })

        }

        const reward_per_winner = Number((bet.total_pot / winners.length).toFixed(2))

        bet.participants = bet.participants.map(p => {

            if (p.option_id.toString() === correct_option.toString()) {
                return {
                    ...p.toObject(),
                    is_winner: true,
                    reward: Number(reward_per_winner.toFixed(2))
                }
            } else {
                return {
                    ...p.toObject(),
                    is_winner: false,
                    reward: 0
                }
            }

        })

        bet.status = BET_STATUS.RESOLVED

        for (const winner of winners) {

            const wallet = await Wallet.findOne({ user: winner.user }).session(session)
            if (!wallet) continue

            wallet.balance += reward_per_winner
            await wallet.save({ session })

            const transaction = new Transaction({
                wallet: wallet._id,
                type: TRANSACTION_TYPES.WIN,
                amount: reward_per_winner,
                reference: bet._id,
                description: `Bet reward from: ${bet.title}`,
                balance_after: wallet.balance
            })

            await transaction.save({ session })

        }

        await bet.save({ session })
        await session.commitTransaction()
        session.endSession()

        logger.info(`Winner set successfully and prizes distributed by ${decoded.id} in bet ${bet.id}`)

        return res.status(200).json({
            success: true,
            message: 'Winner set successfully and prizes distributed.',
            data: bet
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        logger.error(`Set Winner Bet Error: ${error.message}`)
        next(error)
    }
}

export const getBets = async (req, res, next) => {
    try {

        const { decoded, query } = req
        const { skip, limit, page, page_size } = getPagination(query)
        const { search, status } = query

        let filter = {}

        if (decoded.role !== ROLES.ADMIN) filter.user = decoded.id
        if (search) filter.title = searchRegex(search)
        if (status) filter.status = status

        const total = await Bet.countDocuments(filter)

        let bets = await Bet.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('image title date start_time end_time status amount createdAt')
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Bet fetched successfully.',
            ...buildPaginationResponse(bets, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Bet Error: ${error.message}`)
        next(error)
    }
}

export const getBetById = async (req, res, next) => {
    try {

        const { decoded, params } = req
        const { id } = params

        const filter = {
            _id: id,
            $or: [
                {
                    user: decoded.role === ROLES.ADMIN ? { $exists: true } : decoded.id
                },
                {
                    'invited_participants.user': decoded.id
                }
            ]
        }

        const bet = await Bet.findOne(filter, { participants: 0, total_pot: 0 })
            .populate('user', 'name image')
            .populate('invited_participants.user', 'name image')
            .lean({ virtuals: true })

        if (!bet) {
            return res.status(404).json({
                success: false,
                message: 'Bet not found or you do not have access.'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Bet fetched successfully.',
            data: bet
        })

    } catch (error) {
        logger.error(`Get Bet by ID Error: ${error.message}`)
        next(error)
    }
}

export const getInvitedBets = async (req, res, next) => {
    try {

        const { decoded, query } = req
        const { skip, limit, page, page_size } = getPagination(query)
        const { search, status } = query

        let filter = { user: { $ne: decoded.id }, 'invited_participants.user': decoded.id }

        if (search) filter.title = searchRegex(search)
        if (status) filter.status = status

        const total = await Bet.countDocuments(filter)

        const bets = await Bet.find(filter)
            .sort({ start_time: -1 })
            .skip(skip)
            .limit(limit)
            .select('image title date start_time end_time status amount')
            .lean({ virtuals: true })

        return res.status(200).json({
            success: true,
            message: 'Invited bets fetched successfully.',
            ...buildPaginationResponse(bets, total, page, page_size),
        })

    } catch (error) {
        logger.error(`Get Invited Bets Error: ${error.message}`)
        next(error)
    }
}