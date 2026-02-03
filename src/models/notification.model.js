import mongoose from 'mongoose'

const notification_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    metadata: {
        type: Object,
        default: null
    },
    recipients: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        read_at: {
            type: Date
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

export default mongoose.model('Notification', notification_schema)
