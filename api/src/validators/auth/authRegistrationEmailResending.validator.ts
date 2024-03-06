import { body } from 'express-validator'
import { authRepository } from '../../compositionRoot'
import { inputValidation } from '../../middlewares/input.validation'

export const emailValidation = body('email')
	.isString()
	.withMessage('Email must be a string')
	.matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
	.withMessage('Incorrect email')
	.custom(async (value) => {
		const user = await authRepository.getUserByEmail(value)

		if (!user || user.emailConfirmation.isConfirmed) {
			throw new Error('Email is already confirmed')
		}

		return true
	})
	.withMessage('Email is already confirmed')

export function authRegistrationEmailResending() {
	return [emailValidation, inputValidation]
}
