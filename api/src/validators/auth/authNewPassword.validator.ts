import { body } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'
import { authRepository } from '../../repositories/auth.repository'
import { usersRepository } from '../../repositories/users.repository'

export const newPasswordValidation = body('newPassword')
	.isString()
	.withMessage('New password must be a string')
	.trim()
	.isLength({ min: 6, max: 20 })
	.withMessage('Incorrect New password')

export const recoveryCodeValidation = body('recoveryCode')
	.isString()
	.withMessage('Recovery code must be a string')
	.custom(async (value) => {
		const user = await usersRepository.getUserByPasswordRecoveryCode(value)

		if (!user) {
			throw new Error('User does not exist')
		}

		return true
	})
	.withMessage('User does not exist')

export function authNewPasswordValidation() {
	return [newPasswordValidation, recoveryCodeValidation, inputValidation]
}
