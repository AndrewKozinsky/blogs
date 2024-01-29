import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'
import { blogsRepository } from '../../repositories/blogs.repository'

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

export const blogIdValidation = body('blogId')
	.isString()
	.withMessage('BlogId must be a string')
	.trim()
	.isLength({ min: 1, max: 100 })
	.custom(async (value) => {
		const blog = await blogsRepository.getBlogById(value)

		if (!blog) {
			throw new Error('Incorrect blogId')
		}

		return true
	})
	.withMessage('Incorrect blogId')

export function postValidation() {
	return [
		titleValidation,
		shortDescriptionValidation,
		contentValidation,
		blogIdValidation,
		inputValidation,
	]
}
