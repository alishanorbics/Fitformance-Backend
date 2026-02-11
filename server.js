import dotenv from 'dotenv'
import http from 'http'
import app from './src/app.js'
import connectDB from './src/config/db.js'
import logger from './src/config/logger.js'
import connectSocket from './src/config/socket.js'
import { makeFolders } from './src/helpers/folder.js'
import { setIO } from './src/helpers/socket.js'

dotenv.config()

const PORT = process.env.PORT || 8080

let server = http.createServer(app)
let io = setIO(server)

const serverHandler = async () => {
    try {

        logger.info(`Server started 🚀 Running on port ${PORT}.`)

        makeFolders()
        await connectDB()
        await connectSocket(io)

    } catch (e) {
        logger.error("Error while connecting server :: ", e)
        process.exit(1)
    }
}

server.listen(PORT, serverHandler)
