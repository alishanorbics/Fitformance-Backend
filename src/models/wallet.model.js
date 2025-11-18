import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { formatCurrency } from '../utils/index.js'

dotenv.config()

const wallet_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    stripe_account_id: {
        type: String
    },
    stripe_onboarding_complete: {
        type: Boolean,
        default: false
    }
}, {
    id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

wallet_schema.virtual('formatted_balance').get(function () {
    return formatCurrency(this.balance, 'USD', '$')
})

wallet_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Wallet', wallet_schema)