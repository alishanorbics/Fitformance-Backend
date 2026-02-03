import logger from "../config/logger.js"
import { createPackage, getAllPackages, subscribe } from "../helpers/stripe.js"

export const getPackages = async (req, res, next) => {

    try {

        const packages = await getAllPackages()

        logger.info(`Package listing fetched`)

        return res.status(200).json({
            success: true,
            message: "Packages fetched successfully.",
            data: packages
        })

    } catch (error) {
        logger.error(`Get Packages Error: ${error.message}`)
        next(error)
    }
}

export const addPackage = async (req, res, next) => {

    try {
        const { body } = req
        const { name, description, amount, interval } = body

        const plan = await createPackage({ name, description, amount, interval })

        logger.info(`Package created`)

        return res.status(201).json({
            success: true,
            message: 'Package created successfully.',
            data: plan
        })

    } catch (error) {
        next(error)
    }

}

export const subscribePackage = (async (req, res) => {

    try {

        const { decoded, params } = req
        const { id } = params

        const data = await subscribe(id, decoded.id)

        logger.info(`Checkout session generated for user ${decoded.id} and package ${id}`)

        return res.status(201).send({
            success: true,
            message: "Successfully Generated Checkout Session",
            data
        })

    } catch (error) {
        next(error)
    }
})