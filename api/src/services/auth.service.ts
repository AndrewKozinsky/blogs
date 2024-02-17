import { Request } from 'express'
import { browserService } from '../application/browser.service'
import { jwtService } from '../application/jwt.service'
import { emailManager } from '../managers/email.manager'
import { ReqWithBody } from '../models/common'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { MeOutModel } from '../models/output/auth.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { authRepository } from '../repositories/auth.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'
import { commonService } from './common'
import { usersService } from './users.service'

type GenAccessAndRefreshTokensServiceRes = { newAccessToken: string; newRefreshToken: string }

type RegistrationServiceRes = { status: 'fail' | 'success' }

export const authService = {
	async login(
		req: ReqWithBody<AuthLoginDtoModel>,
	): Promise<LayerResult<{ refreshToken: string; user: UserServiceModel }>> {
		const userRes = await authRepository.getConfirmedUserByLoginOrEmailAndPassword(req.body)

		if (userRes.code !== LayerResultCode.Success || !userRes.data) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		const clientIP = browserService.getClientIP(req)
		const clientName = browserService.getClientName(req)

		const refreshTokenForDb = jwtService.createRefreshTokenForDb(
			userRes.data.id,
			clientIP,
			clientName,
		)
		await jwtService.setRefreshTokenForDb(refreshTokenForDb)

		const refreshTokenStr = jwtService.createRefreshTokenStr(refreshTokenForDb.deviceId)

		return {
			code: LayerResultCode.Success,
			data: {
				refreshToken: refreshTokenStr,
				user: userRes.data,
			},
		}
	},

	async generateAccessAndRefreshTokens(
		req: Request,
	): Promise<GenAccessAndRefreshTokensServiceRes> {
		const refreshTokenStr = jwtService.getDeviceRefreshTokenFromReq(req)
		const deviceToken = await authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

		if (!deviceToken || !jwtService.isRefreshTokenInDbValid(deviceToken)) {
			return {
				newAccessToken: '',
				newRefreshToken: '',
			}
		}

		const userRes = await authRepository.getConfirmedUserByLoginOrEmailAndPassword(req.body)

		if (userRes.code !== LayerResultCode.Success || !userRes.data) {
			return {
				newAccessToken: '',
				newRefreshToken: '',
			}
		}

		await authRepository.updateDeviceRefreshTokenDate(deviceToken.deviceId)

		const clientIP = browserService.getClientIP(req)
		const clientName = browserService.getClientName(req)

		const newDeviceRefreshToken = jwtService.createRefreshTokenForDb(
			userRes.data.id,
			clientIP,
			clientName,
		)

		const newRefreshToken = await jwtService.setRefreshTokenForDb(newDeviceRefreshToken)

		return {
			newAccessToken: jwtService.createAccessToken(deviceToken.userId),
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
	): Promise<LayerResult<null>> {
		const { email } = dto

		const user = await authRepository.getUserByEmail(email)

		if (!user || user.emailConfirmation.isConfirmed) {
			return {
				code: LayerResultCode.BadRequest,
			}
		}

		const newConfirmationCode = await authRepository.setNewEmailConfirmationCode(user.id)

		try {
			emailManager.sendEmailConfirmationMessage(email, newConfirmationCode)
		} catch (err: unknown) {
			console.log(err)

			return {
				code: LayerResultCode.BadRequest,
			}
		}

		return {
			code: LayerResultCode.Success,
		}
	},

	getCurrentUser(user: UserServiceModel): MeOutModel {
		return {
			userId: user.id,
			email: user.account.email,
			login: user.account.login,
		}
	},

	async logout(refreshToken: string): Promise<LayerResult<null>> {
		const refreshTokenInDb = await authRepository.getDeviceRefreshTokenByTokenStr(refreshToken)

		if (!refreshTokenInDb || !jwtService.isRefreshTokenInDbValid(refreshTokenInDb)) {
			return { code: LayerResultCode.Unauthorized }
		}

		await authRepository.deleteDeviceRefreshTokenByDeviceId(refreshTokenInDb.deviceId)

		return { code: LayerResultCode.Success }
	},
}
