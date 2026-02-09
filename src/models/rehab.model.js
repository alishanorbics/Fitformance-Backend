import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { ENUM_REHAB_TYPES, REHAB_TYPES } from '../utils/index.js'

dotenv.config()

const rehab_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ENUM_REHAB_TYPES,
    },
    is_premium: {
        type: Boolean,
        default: false,
    },
    file: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

rehab_schema.virtual('file_url').get(function () {

    if (!this.file) {
        return null
    }

    if (this.file && this.file.startsWith('http')) {
        return this.file
    }

    return `${process.env.BASE_URL}${this.file}`

})

rehab_schema.virtual('rehab_type').get(function () {

    if (!this.type) {
        return null
    }

    if (this.type === REHAB_TYPES.DOCUMENT) {
        return "protocol"
    } else if (this.type === REHAB_TYPES.IMAGE || this.type === REHAB_TYPES.VIDEO) {
        return "library"
    }

    return `${process.env.BASE_URL}${this.file}`

})

export default mongoose.model('Rehab', rehab_schema)
