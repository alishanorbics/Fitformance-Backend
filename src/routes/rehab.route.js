import express from 'express'
import { addRehab, getRehabById, getRehabs } from '../controllers/rehab.controller.js'
import { CREATE_REHAB_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getRehabs)

router.get('/get/:id', AuthVerifier, getRehabById)

router.post('/create', AuthVerifier, upload('rehab').single('file'), validator(CREATE_REHAB_VALIDATOR), addRehab)

export default router