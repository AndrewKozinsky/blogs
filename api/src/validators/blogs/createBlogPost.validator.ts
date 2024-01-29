import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const titleValidation = body('title')
	.isString()
	.withMessage('Title must be a string')
	.trim()
	.isLength({ min: 1, max: 30 })
	.withMessage('Incorrect title')

export const shortDescriptionValidation = body('shortDescription')
	.isString()
	.withMessage('ShortDescription must be a string')
	.trim()
	.isLength({ min: 1, max: 100 })
	.withMessage('Incorrect shortDescription')

export const contentValidation = body('content')
	.isString()
	.withMessage('Content must be a string')
	.trim()
	.isLength({ min: 1, max: 1000 })
	.withMessage('Incorrect content')

export function createBlogPostsValidation() {
	return [titleValidation, shortDescriptionValidation, contentValidation, inputValidation]
}
