import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { encryptData } from '../helpers/encryption.js'
import { AUTH_TYPES, DUMMY_USER_IMAGE_PATH, ENUM_AUTH_TYPES, ENUM_ROLES, ROLES } from '../utils/index.js'

dotenv.config()

const user_schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return this.auth_provider === AUTH_TYPES.EMAIL
        }
    },
    age: {
        type: Number,
        required: false
    },
    injury: {
        type: String,
        required: function () {
            return this.role === ROLES.USER
        },
    },
    image: {
        type: String,
        default: DUMMY_USER_IMAGE_PATH
    },
    country_code: {
        type: String,
        required: true
    },
    dialing_code: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    device_ids: [{
        type: String
    }],
    therapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    role: {
        type: String,
        enum: ENUM_ROLES,
        default: ROLES.USER
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    auth_provider: {
        type: String,
        enum: ENUM_AUTH_TYPES,
        default: AUTH_TYPES.EMAIL
    },
    provider_id: {
        type: String,
        required: function () {
            return this.auth_provider !== AUTH_TYPES.EMAIL
        }
    },
    stripe_customer_id: {
        type: String
    }
}, {
    id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

user_schema.pre('save', (async function (next) {
    if (this.isModified('password')) {
        let encryptedPassword = await encryptData(this.password)
        this.password = encryptedPassword
    }

    return next()

}))

user_schema.pre('findOneAndUpdate', (async function (next) {
    if (this._update.password) {
        let encryptedPassword = await encryptData(this._update.password)
        this._update.password = encryptedPassword
    }

    return next()

}))

user_schema.virtual('image_url').get(function () {

    if (!this.image) {
        return null
    }

    if (this.image && this.image.startsWith('http')) {
        return this.image
    }

    return `${process.env.BASE_URL}${this.image}`

})

user_schema.virtual('profile_completed').get(function () {
    return !!this.gender
})

user_schema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } })

user_schema.plugin(mongooseLeanVirtuals)

const User = mongoose.model('User', user_schema)

export default User