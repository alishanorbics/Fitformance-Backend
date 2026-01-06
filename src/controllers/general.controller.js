import logger from '../config/logger.js'

export const getContent = async (req, res, next) => {
    try {

        const base = `https://${req.host}/uploads/`

        const data = {
            about_us: base + "about-us.html",
            privacy_policy: base + "privacy-policy.html",
            terms: base + "terms.html",
        }

        return res.status(200).json({
            success: true,
            data
        })

    } catch (error) {
        logger.error(`Add Funds Error: ${error.message}`)
        next(error)
    }
}