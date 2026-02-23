import axios from "axios"
import dotenv from "dotenv"
import logger from "./logger.js"

dotenv.config()

const api = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        logger.error("TMDB Error:", error.response?.data || error.message)
        return Promise.reject(error)
    }
)

export default api