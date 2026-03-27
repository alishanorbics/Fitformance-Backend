import logger from "../config/logger.js"
import mongoose from "mongoose"
import Plan from "../models/plan.model.js"
import User from "../models/user.model.js"
import RehabAssignment from "../models/rehabassignment.model.js"

export const addPlan = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { body, decoded } = req
        const { user: user_id, exercises = [], protocol = [], library = [] } = body
        const therapist = decoded.id

        const user = await User.findById(user_id).session(session)
        if (!user) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (user.therapist?.toString() !== therapist) {
            await session.abortTransaction()
            session.endSession()
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create a plan for this user"
            })
        }

        for (const exercise of exercises) {
            const plan = new Plan({
                user: user._id,
                therapist,
                ...exercise
            })
            await plan.save({ session })
        }

        const rehabs = [...protocol, ...library]

        for (const rehab of rehabs) {
            const rehab_assignment = new RehabAssignment({
                user: user._id,
                therapist,
                rehab: rehab
            })
            await rehab_assignment.save({ session })
        }

        await session.commitTransaction()
        session.endSession()

        logger.info(
            `Created plans and rehab assignments by therapist ${therapist} for user ${user._id}`
        )

        return res.status(201).json({
            success: true,
            message: "All plans and rehab assignments created successfully"
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        logger.error(`Add Plan Error: ${error.message}`)
        next(error)
    }
}