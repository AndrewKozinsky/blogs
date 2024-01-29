import { emailManager } from '../managers/email.manager'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { MeOutModel } from '../models/output/auth.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { authRepository } from '../repositories/auth.repository'
import { commonService } from './common'
import { usersService } from './users.service'

export const authService = {
	async getUserByLoginOrEmailAndPassword(dto: AuthLoginDtoModel) {
		const user = await authRepository.getUserByLoginOrEmailAndPassword(dto)

		if (!user || !user.emailConfirmation.isConfirmed) {
			return null
		}

		return user
	},

	async registration(dto: AuthRegistrationDtoModel): Promise<{ status: 'fail' | 'success' }> {
		const userByEmail = await authRepository.getUserByLoginOrEmail(dto.email)
		if (userByEmail) {
			return { status: 'fail' }
		}

		const newUserDto = await commonService.getCreateUserDto(dto, false)

		const userId = await authRepository.createUser(newUserDto)

		const user = await usersService.getUser(userId)
		if (!user) {
			return { status: 'fail' }
		}

		try {
			await emailManager.sendEmailConfirmationMessage(
				user.account.email,
				user.emailConfirmation.confirmationCode,
			)

			return {
				status: 'success',
			}
		} catch (err: unknown) {
			console.log(err)
			await authRepository.deleteUser(userId)

			return { status: 'fail' }
		}
	},

	async confirmEmail(confirmationCode: string): Promise<{ status: 'fail' | 'success' }> {
		const user = await authRepository.getUserByConfirmationCode(confirmationCode)
		if (!user || user.emailConfirmation.isConfirmed) {
			return {
				status: 'fail',
			}
		}

		if (
			user.emailConfirmation.confirmationCode !== confirmationCode ||
			user.emailConfirmation.expirationDate < new Date()
		) {
			return {
				status: 'fail',
			}
		}

		await authRepository.makeUserEmailConfirmed(user.id)

		return {
			status: 'success',
		}
	},

	async resendEmailConfirmationCode(
		dto: AuthRegistrationEmailResendingDtoModel,
	): Promise<{ status: 'fail' | 'success' }> {
		const { email } = dto

		const user = await authRepository.getUserByEmail(email)

		if (!user || user.emailConfirmation.isConfirmed) {
			return {
				status: 'fail',
			}
		}

		let confirmationCode = user.emailConfirmation.confirmationCode

		if (user.emailConfirmation.expirationDate < new Date()) {
			// Set new email confirmation code
			confirmationCode = await authRepository.setNewEmailConfirmationCode(user.id)
		}

		try {
			await emailManager.sendEmailConfirmationMessage(email, confirmationCode)

			return {
				status: 'success',
			}
		} catch (err: unknown) {
			console.log(err)

			return {
				status: 'fail',
			}
		}
	},

	getCurrentUser(user: UserServiceModel): MeOutModel {
		return {
			userId: user.id,
			email: user.account.email,
			login: user.account.login,
		}
	},
}
