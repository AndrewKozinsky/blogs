import { body, param } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const contentValidation = body('content')
	.isString()
	.withMessage('Content must be a string')
	.trim()
	.isLength({ min: 20, max: 300 })
	.withMessage('Incorrect content length')

export const blogIdValidation = param('postId')
	.isString()
	.withMessage('PostId must be a string')
	.trim()

export function createPostCommentValidation() {
	return [contentValidation, blogIdValidation, inputValidation]
}
