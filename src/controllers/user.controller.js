import logger from '../config/logger.js'
import { compareData } from '../helpers/encryption.js'
import { removeFiles } from '../helpers/folder.js'
import User from '../models/user.model.js'

export const getMyProfile = async (req, res, next) => {

    try {
        const { decoded } = req

        const user = await User.findById(decoded.id)
            .select("-password")
            .lean({ virtuals: true })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            })
        }

        logger.info(`Profile fetched for user: ${user.email}`)

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully.",
            data: user
        })

    } catch (error) {
        logger.error(`Get Profile Error: ${error.message}`)
        next(error)
    }
}

export const changePassword = async (req, res, next) => {
    try {

        const { decoded, body } = req
        const { old_password, new_password } = body

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            })
        }

        const matched = await compareData(old_password, user.password)

        if (!matched) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect.",
            })
        }

        user.password = new_password
        await user.save()

        logger.info(`Password changed successfully for: ${user.email}`)

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        })

    } catch (error) {
        logger.error(`Change Password Error: ${error.message}`)
        next(error)
    }
}

export const updateProfile = async (req, res, next) => {
    try {

        const { decoded, body, file } = req
        const { name, username, gender, country_code, dialing_code, phone } = body

        let user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            })
        }

        const updated_fields = {}
        if (name) updated_fields.name = name
        if (username) updated_fields.username = username
        if (gender) updated_fields.gender = gender
        if (country_code) updated_fields.country_code = country_code
        if (dialing_code) updated_fields.dialing_code = dialing_code
        if (phone) updated_fields.phone = phone

        if (file && file.path) {
            if (user?.image) removeFiles(user?.image)
            updated_fields.image = file.path
        }

        user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updated_fields },
            { new: true, runValidators: true }
        )

        logger.info(`Profile updated successfully for: ${user.email}`)

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: { user }
        })

    } catch (error) {
        logger.error(`Update Profile Error: ${error.message}`)
        next(error)
    }
}

export const removeImage = async (req, res, next) => {
    try {

        const { decoded } = req

        let user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            })
        }

        if (user?.image) {
            removeFiles(user?.image)
        }

        user.image = null
        await user.save()

        logger.info(`Image removed successfully for: ${user.email}`)

        return res.status(200).json({
            success: true,
            message: "Image removed successfully.",
            data: { user }
        })

    } catch (error) {
        logger.error(`Remove Image Error: ${error.message}`)
        next(error)
    }
}