import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { BET_PARTICIPATION_STATUS, BET_PROCCESS_STATUS, BET_STATUS, ENUM_BET_PARTICIPATION_STATUS, ENUM_BET_STATUS } from '../utils/index.js'

dotenv.config()

const participant_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    option_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    is_winner: {
        type: Boolean,
        default: false
    },
    reward: {
        type: Number,
        default: 0
    }
}, { id: false })

const invited_participant_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ENUM_BET_PARTICIPATION_STATUS,
        default: BET_PARTICIPATION_STATUS.NOT_CONFIRMED
    }
}, { id: false })

const option_schema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    }
}, { id: false })

const bet_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    question: {
        type: String,
        required: true
    },
    options: [option_schema],
    invited_participants: [invited_participant_schema],
    participants: [participant_schema],
    correct_option: {
        type: mongoose.Schema.Types.ObjectId
    },
    total_pot: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ENUM_BET_STATUS,
        default: BET_STATUS.PENDING
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
})

bet_schema.virtual('image_url').get(function () {
    if (this.image && this.image.startsWith('http')) {
        return this.image
    }
    return `${process.env.BASE_URL}${this.image}`
})

bet_schema.virtual('current_status').get(function () {

    const now = new Date()

    if (this.status === BET_STATUS.RESOLVED || this.status === BET_STATUS.CANCELLED) {
        return this.status
    }

    const bet_date = new Date(this.date)
    const start = new Date(bet_date)
    const end = new Date(bet_date)

    start.setHours(this.start_time.getHours(), this.start_time.getMinutes(), 0, 0)
    end.setHours(this.end_time.getHours(), this.end_time.getMinutes(), 0, 0)

    if (now.getTime() < start.getTime()) return BET_PROCCESS_STATUS.UPCOMING
    if (now.getTime() >= start.getTime() && now.getTime() < end.getTime()) return BET_PROCCESS_STATUS.OPEN
    if (now.getTime() >= end.getTime()) return BET_PROCCESS_STATUS.CLOSED

    return this.status

})

bet_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Bet', bet_schema)