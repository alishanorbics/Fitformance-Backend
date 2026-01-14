import { encryptData } from "../helpers/encryption.js"

export const DUMMY_USER_IMAGE_PATH = "uploads/user/dummy.jpg"

export const REGEX = {
    USERNAME: /^[a-zA-Z0-9._]{3,30}$/
}

export const ROLES = {
    ADMIN: "admin",
    USER: "user"
}

export const ENUM_ROLES = Object.values(ROLES)

export const AUTH_TYPES = {
    EMAIL: "email",
    GOOGLE: "google",
    APPLE: "apple",
}

export const ENUM_AUTH_TYPES = Object.values(AUTH_TYPES)

export const GENDERS = {
    MALE: 'male',
    FEMALE: 'female'
}

export const ENUM_GENDERS = Object.values(GENDERS)

export const BET_STATUS = {
    PENDING: "pending",
    RESOLVED: "resolved",
    CANCELLED: "cancelled"
}

export const ENUM_BET_STATUS = Object.values(BET_STATUS)

export const BET_PROCCESS_STATUS = {
    UPCOMING: "upcoming",
    OPEN: "open",
    CLOSED: "closed"
}

export const ENUM_BET_PROCCESS_STATUS = Object.values(BET_PROCCESS_STATUS)

export const BET_PARTICIPATION_STATUS = {
    CONFIRMED: "confirmed",
    NOT_CONFIRMED: "not_confirmed"
}

export const ENUM_BET_PARTICIPATION_STATUS = Object.values(BET_PARTICIPATION_STATUS)

export const TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
    BET: 'bet',
    WIN: 'win',
    REFUND: 'refund'
}

export const ENUM_TRANSACTION_TYPES = Object.values(TRANSACTION_TYPES)

export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
}

export const ENUM_TRANSACTION_STATUS = Object.values(TRANSACTION_STATUS)

export const DISPUTE_STATUS = {
    PENDING: 'pending',
    REJECTED: 'rejected',
    RESOLVED: 'resolved'
}

export const ENUM_DISPUTE_STATUS = Object.values(DISPUTE_STATUS)

export const generateOtp = async (length = 6) => {

    if (length < 4 || length > 10) {
        throw new Error('OTP length must be between 4 and 10 digits')
    }

    const otp = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
    const hashed = await encryptData(otp)

    return { otp, hashed }

}

export const searchRegex = (text, exact = false) => {

    if (!text) return /.*/

    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const pattern = exact ? `^${escaped}$` : escaped

    return new RegExp(pattern, 'i')

}

export const calculateAge = (date_of_birth) => {

    if (!date_of_birth) return { years: 0, months: 0, days: 0 }

    const dob = new Date(date_of_birth)
    const now = new Date()

    let years = now.getFullYear() - dob.getFullYear()
    let months = now.getMonth() - dob.getMonth()
    let days = now.getDate() - dob.getDate()

    if (days < 0) {
        months -= 1
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        days += prevMonth.getDate()
    }

    if (months < 0) {
        years -= 1
        months += 12
    }

    return { years, months, days }

}

export const formatCurrency = (amount, currency = 'USD', sign = '$') => {

    const formatted = `${sign}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

    return {
        amount,
        currency,
        sign,
        formatted
    }

}