import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const emailValidation = body('email')
	.isString()
	.withMessage('Email must be a string')
	.matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
	.withMessage('Incorrect email')

export function authPasswordRecoveryValidation() {
	return [emailValidation, inputValidation]
}
