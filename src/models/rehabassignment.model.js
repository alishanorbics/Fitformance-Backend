import dotenv from 'dotenv'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

dotenv.config()

const rehab_assignment_schema = new mongoose.Schema({
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
    rehab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rehab",
        required: true,
    }
}, {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

rehab_assignment_schema.plugin(mongooseLeanVirtuals)

export default mongoose.model('RehabAssignment', rehab_assignment_schema)
