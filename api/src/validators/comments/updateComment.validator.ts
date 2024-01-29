import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const contentValidation = body('content')
	.isString()
	.withMessage('Content must be a string')
	.trim()
	.isLength({ min: 20, max: 300 })
	.withMessage('Incorrect content')

export function updateCommentValidation() {
	return [contentValidation, inputValidation]
}
