import { add, addMilliseconds } from 'date-fns'
import { jwtService } from '../application/jwt.service'
import { config, HTTP_STATUSES } from '../config/config'
import { emailManager } from '../managers/email.manager'
import { DBTypes } from '../models/db'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { MeOutModel } from '../models/output/auth.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { authRepository } from '../repositories/auth.repository'
import { createUniqString } from '../utils/stringUtils'
import { commonService } from './common'
import { usersService } from './users.service'

type LoginServiceRes =
	| { status: 'fail' }
	| { status: 'success'; refreshToken: string; user: UserServiceModel }

type GenAccessAndRefreshTokensServiceRes = { newAccessToken: string; newRefreshToken: string }

type RegistrationServiceRes = { status: 'fail' | 'success' }

type LogoutServiceRes = { status: 'refreshTokenNoValid' | 'refreshTokenValid' }

export const authService = {
	async getUserByLoginOrEmailAndPassword(dto: AuthLoginDtoModel) {
		const user = await authRepository.getUserByLoginOrEmailAndPassword(dto)

		if (!user || !user.emailConfirmation.isConfirmed) {
			return null
		}

		return user
	},

	async login(loginDto: AuthLoginDtoModel): Promise<LoginServiceRes> {
		const user = await this.getUserByLoginOrEmailAndPassword(loginDto)

		if (!user) {
			return {
				status: 'fail',
			}
		}

		const refreshToken = await authService.createRefreshTokenAndSetToDb(user.id)

		return {
			status: 'success',
			refreshToken,
			user,
		}
	},

	async generateAccessAndRefreshTokens(
		refreshToken: string,
	): Promise<GenAccessAndRefreshTokensServiceRes> {
		const refreshTokenInDb = await authRepository.getRefreshTokenByValue(refreshToken)

		if (!refreshTokenInDb || refreshTokenInDb.expirationDate < new Date()) {
			return {
				newAccessToken: '',
				newRefreshToken: '',
			}
		}

		await authRepository.deleteRefreshToken(refreshToken)

		const newRefreshToken = await this.createRefreshTokenAndSetToDb(refreshTokenInDb.userId)

		return {
			newAccessToken: jwtService.createJWT(refreshTokenInDb.userId),
			newRefreshToken: newRefreshToken,
		}
	},

	async registration(dto: AuthRegistrationDtoModel): Promise<RegistrationServiceRes> {
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

		const newConfirmationCode = await authRepository.setNewEmailConfirmationCode(user.id)

		try {
			emailManager.sendEmailConfirmationMessage(email, newConfirmationCode)
		} catch (err: unknown) {
			console.log(err)

			return {
				status: 'fail',
			}
		}

		return {
			status: 'success',
		}
	},

	getCurrentUser(user: UserServiceModel): MeOutModel {
		return {
			userId: user.id,
			email: user.account.email,
			login: user.account.login,
		}
	},

	async logout(refreshToken: string): Promise<LogoutServiceRes> {
		const refreshTokenInDb = await authRepository.getRefreshTokenByValue(refreshToken)

		const isRefreshTokenValid = refreshTokenInDb && refreshTokenInDb.expirationDate > new Date()

		if (!isRefreshTokenValid) {
			return { status: 'refreshTokenNoValid' }
		}

		await authRepository.deleteRefreshToken(refreshTokenInDb.refreshToken)

		return { status: 'refreshTokenValid' }
	},

	async createRefreshTokenAndSetToDb(userId: string) {
		const refreshTokenForDB: DBTypes.RefreshToken = {
			userId,
			refreshToken: createUniqString(),
			expirationDate: addMilliseconds(new Date(), config.refreshToken.lifeDurationInMs),
		}

		await authRepository.setNewRefreshToken(refreshTokenForDB)

		return refreshTokenForDB.refreshToken
	},
}
