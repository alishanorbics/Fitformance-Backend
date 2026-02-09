import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const reminder_schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    therapist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

const Reminder = mongoose.model('Reminder', reminder_schema)

export default Reminder