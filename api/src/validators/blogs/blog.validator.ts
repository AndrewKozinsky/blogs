import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const nameValidation = body('name')
	.isString()
	.withMessage('Name must be a string')
	.trim()
	.isLength({ min: 1, max: 15 })
	.withMessage('Incorrect name')

export const descriptionValidation = body('description')
	.isString()
	.withMessage('Description must be a string')
	.trim()
	.isLength({ min: 1, max: 500 })
	.withMessage('Incorrect description')

export const websiteUrlValidation = body('websiteUrl')
	.isString()
	.withMessage('WebsiteUrl must be a string')
	.trim()
	.isLength({ min: 1, max: 100 })
	.withMessage('WebsiteUrl length must be from 1 till 100')
	.matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$')
	.withMessage('Incorrect websiteUrl')

export function blogValidation() {
	return [nameValidation, descriptionValidation, websiteUrlValidation, inputValidation]
}
