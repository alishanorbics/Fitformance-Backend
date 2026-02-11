import { verifyToken } from '../helpers/token.js'
import logger from './logger.js'

const connectSocket = async (io) => {
    try {

        io.on('connection', async (socket) => {

            let token = socket.handshake.query.token
            token = token.split(' ')[1]
            let decoded = await verifyToken(token)

            if (decoded) {
                socket.user_id = decoded.id
                logger.info("Socket Connection Successfully Created", socket.id, socket.user_id)
                // socketController(socket, io)
            }

        })

    } catch (e) {
        logger.error("Error while connecting to Sockets", e)
    }
}

export default connectSocket