import express from 'express'
import { addCategory, getCategories, toggleStatus, updateCategory } from '../controllers/category.controller.js'
import { CREATE_CATEGORY_VALIDATOR, UPDATE_CATEGORY_VALIDATOR } from '../helpers/validators.js'
import { AuthVerifier } from '../middleware/auth.middleware.js'
import validator from '../middleware/validator.js'

const router = express.Router()

router.get('/get', AuthVerifier, getCategories)

router.post('/create', AuthVerifier, validator(CREATE_CATEGORY_VALIDATOR), addCategory)

router.patch('/update/:id', AuthVerifier, validator(UPDATE_CATEGORY_VALIDATOR), updateCategory)

router.patch('/toggle-status/:id', AuthVerifier, toggleStatus)

export default router