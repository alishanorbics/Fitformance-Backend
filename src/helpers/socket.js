import { Server } from "socket.io"

let io

export const setIO = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    return io

}

export const getIO = () => {

    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io

}
