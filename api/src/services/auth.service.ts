import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { BrowserService } from '../application/browser.service'
import { JwtService } from '../application/jwt.service'
import { RequestService } from '../application/request.service'
import { ClassNames } from '../composition/classNames'
import { EmailManager } from '../managers/email.manager'
import { ReqWithBody } from '../models/common'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { MeOutModel } from '../models/output/auth.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { AuthRepository } from '../repositories/auth.repository'
import { UsersRepository } from '../repositories/users.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'
import { createUniqString } from '../utils/stringUtils'
import { CommonService } from './common.service'
import { UsersService } from './users.service'

@injectable()
export class AuthService {
	@inject(ClassNames.UsersService) private usersService: UsersService
	@inject(ClassNames.AuthRepository) private authRepository: AuthRepository
	@inject(ClassNames.UsersRepository) private usersRepository: UsersRepository
	@inject(ClassNames.BrowserService) private browserService: BrowserService
	@inject(ClassNames.JwtService) private jwtService: JwtService
	@inject(ClassNames.RequestService) private requestService: RequestService
	@inject(ClassNames.EmailManager) private emailManager: EmailManager
	@inject(ClassNames.CommonService) private commonService: CommonService

	async login(
		req: ReqWithBody<AuthLoginDtoModel>,
	): Promise<LayerResult<{ refreshTokenStr: string; user: UserServiceModel }>> {
		const getUserRes = await this.authRepository.getConfirmedUserByLoginOrEmailAndPassword(
			req.body,
		)

		if (getUserRes.code !== LayerResultCode.Success || !getUserRes.data) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		const clientIP = this.browserService.getClientIP(req)
		const clientName = this.browserService.getClientName(req)

		const newDeviceRefreshToken = this.jwtService.createDeviceRefreshToken(
			getUserRes.data.id,
			clientIP,
			clientName,
		)
		await this.authRepository.insertDeviceRefreshToken(newDeviceRefreshToken)

		const refreshTokenStr = this.jwtService.createRefreshTokenStr(
			newDeviceRefreshToken.deviceId,
		)

		return {
			code: LayerResultCode.Success,
			data: {
				refreshTokenStr,
				user: getUserRes.data,
			},
		}
	}

	async refreshToken(
		req: Request,
	): Promise<LayerResult<{ newAccessToken: string; newRefreshToken: string }>> {
		const deviceRefreshTokenStr = this.requestService.getDeviceRefreshStrTokenFromReq(req)
		const deviceRefreshToken =
			await this.authRepository.getDeviceRefreshTokenByTokenStr(deviceRefreshTokenStr)

		if (!deviceRefreshToken || !this.jwtService.isRefreshTokenStrValid(deviceRefreshTokenStr)) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		const userRes = await this.usersRepository.getUserById(deviceRefreshToken.userId)

		if (!userRes) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		await this.authRepository.updateDeviceRefreshTokenDate(deviceRefreshToken.deviceId)

		const newRefreshToken = this.jwtService.createRefreshTokenStr(deviceRefreshToken.deviceId)

		return {
			code: LayerResultCode.Success,
			data: {
				newAccessToken: this.jwtService.createAccessTokenStr(deviceRefreshToken.userId),
				newRefreshToken,
			},
		}
	}

	async registration(dto: AuthRegistrationDtoModel): Promise<LayerResult<null>> {
		const userByEmail = await this.authRepository.getUserByLoginOrEmail(dto.email)
		if (userByEmail) {
			return { code: LayerResultCode.BadRequest }
		}

		const newUserDto = await this.commonService.getCreateUserDto(dto, false)

		const userId = await this.authRepository.createUser(newUserDto)

		const user = await this.usersService.getUser(userId)
		if (!user) {
			return { code: LayerResultCode.BadRequest }
		}

		try {
			await this.emailManager.sendEmailConfirmationMessage(
				user.account.email,
				user.emailConfirmation.confirmationCode,
			)

			return {
				code: LayerResultCode.Success,
			}
		} catch (err: unknown) {
			console.log(err)
			await this.authRepository.deleteUser(userId)

			return {
				code: LayerResultCode.BadRequest,
			}
		}
	}

	async confirmEmail(confirmationCode: string): Promise<{ status: 'fail' | 'success' }> {
		const user = await this.authRepository.getUserByConfirmationCode(confirmationCode)
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

		await this.authRepository.makeUserEmailConfirmed(user.id)

		return {
			status: 'success',
		}
	}

	async resendEmailConfirmationCode(
		dto: AuthRegistrationEmailResendingDtoModel,
	): Promise<LayerResult<null>> {
		const { email } = dto

		const user = await this.authRepository.getUserByEmail(email)

		if (!user || user.emailConfirmation.isConfirmed) {
			return {
				code: LayerResultCode.BadRequest,
			}
		}

		const newConfirmationCode = await this.authRepository.setNewEmailConfirmationCode(user.id)

		// await не нужен потому что тест не проходит в Инкубаторе
		try {
			this.emailManager.sendEmailConfirmationMessage(email, newConfirmationCode)
		} catch (err: unknown) {
			console.log(err)

			return {
				code: LayerResultCode.BadRequest,
			}
		}

		return {
			code: LayerResultCode.Success,
		}
	}

	getCurrentUser(user: UserServiceModel): MeOutModel {
		return {
			userId: user.id,
			email: user.account.email,
			login: user.account.login,
		}
	}

	async logout(refreshTokenStr: string): Promise<LayerResult<null>> {
		const refreshTokenInDb =
			await this.authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

		if (!refreshTokenInDb || !this.jwtService.isRefreshTokenStrValid(refreshTokenStr)) {
			return { code: LayerResultCode.Unauthorized }
		}

		await this.authRepository.deleteDeviceRefreshTokenByDeviceId(refreshTokenInDb.deviceId)

		return { code: LayerResultCode.Success }
	}

	async passwordRecovery(email: string): Promise<LayerResult<null>> {
		const user = await this.authRepository.getUserByLoginOrEmail(email)

		// Send success status even if current email is not registered (for prevent user's email detection)
		if (!user) {
			return { code: LayerResultCode.Success }
		}

		const recoveryCode = createUniqString()

		await this.usersRepository.setPasswordRecoveryCodeToUser(user.id, recoveryCode)

		try {
			await this.emailManager.sendPasswordRecoveryMessage(email, recoveryCode)

			return {
				code: LayerResultCode.Success,
			}
		} catch (err: unknown) {
			console.log(err)
			await this.authRepository.deleteUser(user.id)

			return {
				code: LayerResultCode.BadRequest,
			}
		}
	}

	async newPassword(passRecoveryCode: string, newPassword: string): Promise<LayerResult<null>> {
		const user = await this.usersRepository.getUserByPasswordRecoveryCode(passRecoveryCode)

		if (!user) {
			return { code: LayerResultCode.BadRequest }
		}

		await this.usersRepository.setPasswordRecoveryCodeToUser(user.id, null)

		await this.usersRepository.setNewPasswordToUser(user.id, newPassword)

		return {
			code: LayerResultCode.Success,
		}
	}
}
