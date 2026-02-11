import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { ENUM_MESSAGE_TYPES, MESSAGE_TYPES } from '../utils/index.js'

dotenv.config()

const message_schema = mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String
    },
    type: {
        type: String,
        enum: ENUM_MESSAGE_TYPES,
        default: MESSAGE_TYPES.TEXT
    },
    read_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
})

const Message = mongoose.model('Message', message_schema)

export default Message