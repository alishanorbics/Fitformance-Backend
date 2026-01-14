import mongoose from 'mongoose';
import { DISPUTE_STATUS, ENUM_DISPUTE_STATUS } from '../utils/index.js';

const dispute_schema = new mongoose.Schema({
    bet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bet',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ENUM_DISPUTE_STATUS,
        default: DISPUTE_STATUS.PENDING,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

export default mongoose.model('Dispute', dispute_schema)
