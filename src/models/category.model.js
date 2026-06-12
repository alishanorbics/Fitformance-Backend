import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { ENUM_REHAB_TYPES } from '../utils/index.js'

dotenv.config()

const category_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ENUM_REHAB_TYPES,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

category_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Category', category_schema)
