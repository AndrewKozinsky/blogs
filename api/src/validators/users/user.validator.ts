import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const loginValidation = body('login')
	.isString()
	.withMessage('Login must be a string')
	.trim()
	.isLength({ min: 3, max: 10 })
	.matches('^[a-zA-Z0-9_-]*$')
	.withMessage('Incorrect login')

export const passwordValidation = body('password')
	.isString()
	.withMessage('Password must be a string')
	.trim()
	.isLength({ min: 6, max: 20 })
	.withMessage('Incorrect password')

export const emailValidation = body('email')
	.isString()
	.withMessage('Email must be a string')
	.trim()
	.matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
	.withMessage('Incorrect email')

export function userValidation() {
	return [loginValidation, passwordValidation, emailValidation, inputValidation]
}
