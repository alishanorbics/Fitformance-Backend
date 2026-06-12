import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { ENUM_REHAB_TYPES, getFileExtension, LIBRARY, PROTOCOLS, REHAB_TYPES } from '../utils/index.js'

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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    is_premium: {
        type: Boolean,
        default: false,
    },
    file: {
        type: String,
        required: false,
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

rehab_schema.virtual('file_url').get(function () {

    if (!this.file) {
        return null
    }

    if (this.file && this.file.startsWith('http')) {
        return this.file
    }

    return `${process.env.BASE_URL}${this.file}`

})

rehab_schema.virtual('file_type').get(function () {

    if (!this.file) {
        return null
    }

    const file_extension = getFileExtension(this.file)

    return file_extension

})

rehab_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Rehab', rehab_schema)
