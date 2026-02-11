import logger from "../config/logger.js"
import Conversation from "../models/conversation.model.js"
import Message from "../models//message.model.js"

export const getConversations = async (req, res, next) => {
    try {

        const { decoded } = req

        let filter = {
            participants: { $in: [decoded.id] }
        }

        let conversations = await Conversation.find(filter)
            .populate("participants", "name image")
            .populate({
                path: "last_message",
                select: "content type createdAt sender",
                populate: {
                    path: "sender",
                    select: "_id"
                }
            })
            .sort({ updatedAt: -1 })

        conversations = conversations.map(item => ({
            ...item.toObject(),
            participants: item.participants.filter(item => item._id.toString() !== decoded.id)
        }))

        logger.info(`Conversations fetched | User: ${decoded.id}`)

        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully.",
            data: conversations
        })
    } catch (error) {
        logger.error(`Get Conversations Error: ${error.message}`)
        next(error)
    }
}

export const getConversationById = async (req, res, next) => {
    try {

        const { decoded } = req
        const { id } = req.params

        let conversation = await Conversation.findOne({
            _id: id,
            participants: { $in: [decoded.id] }
        })
            .populate("participants", "name image")
            .populate({
                path: "last_message",
                select: "content type createdAt sender",
                populate: {
                    path: "sender",
                    select: "_id name image"
                }
            }).lean()

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            })
        }

        const messages = await Message.find({ conversation: id }).populate("sender", "_id name image").sort({ createdAt: 1 })

        logger.info(`Conversation with messages fetched | User: ${decoded.id} | Conversation: ${id}`)

        return res.status(200).json({
            success: true,
            message: "Conversation and messages fetched successfully.",
            data: {
                ...conversation,
                messages
            }
        })

    } catch (error) {
        logger.error(`Get Conversation By ID Error: ${error.message}`)
        next(error)
    }
}

export const sendMessage = async (req, res, next) => {
    try {

        const { body, decoded, params } = req
        const { content, type } = body

        const conversation = await Conversation.findOne({ _id: params.id, participants: { $in: [decoded.id] } })

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            })
        }

        const message = await Message.create({
            conversation: conversation._id,
            sender: decoded.id,
            content,
            type,
            read_by: [decoded.id]
        })

        conversation.last_message = message._id
        await conversation.save()

        logger.info(
            `Message sent | Conversation: ${conversation._id} | Sender: ${decoded.id}`
        )

        return res.status(201).json({
            success: true,
            message: "Message sent successfully.",
            data: message
        })

    } catch (error) {
        logger.error(`Send Message Error: ${error.message}`)
        next(error)
    }
}
