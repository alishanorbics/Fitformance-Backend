import dotenv from 'dotenv'
import app from './src/app.js'
import logger from './src/config/logger.js'
import connectDB from './src/config/db.js'
import { makeFolders } from './src/helpers/folder.js'
import User from './src/models/user.model.js'

dotenv.config()

const PORT = process.env.PORT || 8080

const serverHandler = async () => {
    try {

        logger.info(`Server started 🚀 Running on port ${PORT}.`)

        makeFolders()
        await connectDB()

    } catch (e) {
        logger.error("Error while connecting server :: ", e)
        process.exit(1)
    }
}

app.listen(PORT, serverHandler)
