import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const likeStatusValidation = body('likeStatus')
	.isString()
	.withMessage('Like status must be a string')
	.trim()
	.isIn(['None', 'Like', 'Dislike'])
	.withMessage('Incorrect Like status value')

export function postLikeOperationsValidation() {
	return [likeStatusValidation, inputValidation]
}
