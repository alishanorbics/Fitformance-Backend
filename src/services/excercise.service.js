import Plan from "../models/plan.model.js"

export const calculateProgress = async (user) => {

    const plans = await Plan.find({ user }).lean({ virtuals: true }).select("status")

    const completed_exercises = plans.filter(plan => plan?.status === PLAN_STATUS.COMPLETED).length

    const progress = plans.length > 0
        ? Math.round((completed_exercises / plans.length) * 100)
        : 0

    return progress

}