import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { CONVERSATION_TYPES, ENUM_CONVERSATION_TYPES } from '../utils/index.js'

dotenv.config()

const conversation_schema = mongoose.Schema({
    type: {
        type: String,
        enum: ENUM_CONVERSATION_TYPES,
        default: CONVERSATION_TYPES.PRIVATE
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    last_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
}, {
    timestamps: true
})

const Conversation = mongoose.model('Conversation', conversation_schema)

export default Conversation