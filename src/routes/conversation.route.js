import express from 'express'
import { getConversationById, getConversations, sendMessage } from '../controllers/conversation.controller.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/get', AuthVerifier, getConversations)

router.get('/get/:id', AuthVerifier, getConversationById)

router.post('/send-message/:id', AuthVerifier, sendMessage)

export default router