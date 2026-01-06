import express from 'express'
import { getContent } from '../controllers/general.controller.js'

const router = express.Router()

router.get('/get-content', getContent)

export default router