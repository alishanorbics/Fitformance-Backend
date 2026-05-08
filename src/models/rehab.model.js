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
    category_id: {
        type: String,
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

rehab_schema.virtual('category').get(function () {

    if (!this.category_id || !this.type) return null

    const list = this.type === REHAB_TYPES.PROTOCOL ? PROTOCOLS : LIBRARY

    const found = list.find(item => item.id === this.category_id)

    if (!found) return null

    return found

})

rehab_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('Rehab', rehab_schema)
