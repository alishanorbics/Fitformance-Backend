import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { ENUM_TRANSACTION_STATUS, ENUM_TRANSACTION_TYPES, formatCurrency, TRANSACTION_STATUS } from '../utils/index.js'

dotenv.config()

const transaction_schema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ENUM_TRANSACTION_TYPES,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bet'
    },
    external_reference: {
        type: String
    },
    description: {
        type: String
    },
    balance_after: {
        type: Number
    },
    status: {
        type: String,
        enum: ENUM_TRANSACTION_STATUS,
        default: TRANSACTION_STATUS.COMPLETED
    }
}, {
    id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

transaction_schema.virtual('formatted_amount').get(function () {
    return formatCurrency(this.amount, 'USD', '$')
})

transaction_schema.virtual('formatted_balance_after').get(function () {
    return this.balance_after != null ? formatCurrency(this.balance_after, 'USD', '$') : null
})

transaction_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Transaction', transaction_schema)