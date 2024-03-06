import { body } from 'express-validator'
import { authRepository } from '../../compositionRoot'
import { inputValidation } from '../../middlewares/input.validation'

export const loginValidation = body('login')
	.isString()
	.withMessage('Login must be a string')
	.trim()
	.isLength({ min: 3, max: 10 })
	.matches('^[a-zA-Z0-9_-]*$')
	.withMessage('Incorrect login')
	.custom(async (value) => {
		const user = await authRepository.getUserByLoginOrEmail(value)

		if (user) {
			throw new Error('Login exists already')
		}

		return true
	})
	.withMessage('Login exists already')

export const passwordValidation = body('password')
	.isString()
	.withMessage('Password must be a string')
	.trim()
	.isLength({ min: 6, max: 20 })
	.withMessage('Incorrect password')

export const emailValidation = body('email')
	.isString()
	.withMessage('Email must be a string')
	.matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
	.withMessage('Incorrect email')
	.custom(async (value) => {
		const user = await authRepository.getUserByLoginOrEmail(value)

		if (user) {
			throw new Error('Email exists already')
		}

		return true
	})
	.withMessage('Email exists already')

export function authRegistrationValidation() {
	return [loginValidation, passwordValidation, emailValidation, inputValidation]
}
