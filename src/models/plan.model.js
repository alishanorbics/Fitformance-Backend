import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { ENUM_PLAN_STATUS, PLAN_STATUS } from '../utils/index.js'

dotenv.config()

const plan_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    therapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: true,
    },
    frequency: {
        type: Number,
        required: true,
    },
    reps: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ENUM_PLAN_STATUS,
        default: PLAN_STATUS.PENDING
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

export default mongoose.model('Plan', plan_schema)
