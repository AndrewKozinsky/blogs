import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const sortByValidation = body('loginOrEmail')
	.isString()
	.withMessage('LoginOrEmail must be a string')
	.trim()
	.isLength({ min: 1, max: 30 })
	.withMessage('Incorrect loginOrEmail')

export const passwordValidation = body('password')
	.isString()
	.withMessage('Password must be a string')
	.trim()
	.isLength({ min: 1, max: 30 })
	.withMessage('Password must be a string')

export function authLoginValidation() {
	return [sortByValidation, passwordValidation, inputValidation]
}
