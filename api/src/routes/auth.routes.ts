import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { RequestService } from '../application/request.service'
import { ClassNames } from '../composition/classNames'
import { config, HTTP_STATUSES } from '../config/config'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { ReqWithBody } from '../models/common'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationConfirmationDtoModel } from '../models/input/authRegistrationConfirmation.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { AuthNewPasswordDtoModel } from '../models/input/newPassword.input.model'
import { AuthPasswordRecoveryDtoModel } from '../models/input/passwordRecovery.input.model'
import { AuthService } from '../services/auth.service'
import { JwtService } from '../application/jwt.service'
import { LayerResultCode } from '../types/resultCodes'

@injectable()
export class AuthRouter {
	@inject(ClassNames.AuthService) private authService: AuthService
	@inject(ClassNames.RequestService) private requestService: RequestService
	@inject(ClassNames.JwtService) private jwtService: JwtService

	async login(req: ReqWithBody<AuthLoginDtoModel>, res: Response) {
		const loginServiceRes = await this.authService.login(req)

		if (loginServiceRes.code === LayerResultCode.Unauthorized || !loginServiceRes.data) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		res.cookie(config.refreshToken.name, loginServiceRes.data.refreshTokenStr, {
			maxAge: config.refreshToken.lifeDurationInMs,
			httpOnly: true,
			secure: true,
		})

		res.status(HTTP_STATUSES.OK_200).send({
			accessToken: this.jwtService.createAccessTokenStr(loginServiceRes.data.user.id),
		})
	}

	async refreshToken(req: Request, res: Response) {
		const generateTokensRes = await this.authService.refreshToken(req)

		if (generateTokensRes.code === LayerResultCode.Unauthorized) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		const { newAccessToken, newRefreshToken } = generateTokensRes.data!

		res.cookie(config.refreshToken.name, newRefreshToken, {
			maxAge: config.refreshToken.lifeDurationInMs,
			httpOnly: true,
			secure: true,
		})

		res.status(HTTP_STATUSES.OK_200).send({
			accessToken: newAccessToken,
		})
	}

	async registration(req: ReqWithBody<AuthRegistrationDtoModel>, res: Response) {
		const regStatus = await this.authService.registration(req.body)

		if (regStatus.code === LayerResultCode.BadRequest) {
			res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async registrationEmailResending(
		req: ReqWithBody<AuthRegistrationEmailResendingDtoModel>,
		res: Response,
	) {
		const resendingStatus = await this.authService.resendEmailConfirmationCode(req.body)

		if (resendingStatus.code === LayerResultCode.BadRequest) {
			res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async registrationConfirmation(
		req: ReqWithBody<AuthRegistrationConfirmationDtoModel>,
		res: Response,
	) {
		const confirmationStatus = await this.authService.confirmEmail(req.body.code)

		if (confirmationStatus.status === 'fail') {
			res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async getInformationAboutCurrentUser(req: Request, res: Response) {
		const user = this.authService.getCurrentUser(req.user!)
		res.status(HTTP_STATUSES.OK_200).send(user)
	}

	async logout(req: Request, res: Response) {
		const refreshTokenFromCookie = this.requestService.getDeviceRefreshStrTokenFromReq(req)
		const logoutServiceRes = await this.authService.logout(refreshTokenFromCookie)

		if (logoutServiceRes.code === LayerResultCode.Unauthorized) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		res.clearCookie(config.refreshToken.name)
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async passwordRecovery(req: ReqWithBody<AuthPasswordRecoveryDtoModel>, res: Response) {
		const passwordRecoveryServiceRes = await this.authService.passwordRecovery(req.body.email)

		if (passwordRecoveryServiceRes.code !== LayerResultCode.Success) {
			res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
			return
		}

		// 204 Even if current email is not registered (for prevent user's email detection)
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async newPassword(req: ReqWithBody<AuthNewPasswordDtoModel>, res: Response) {
		const passwordRecoveryServiceRes = await this.authService.newPassword(
			req.body.recoveryCode,
			req.body.newPassword,
		)

		if (passwordRecoveryServiceRes.code !== LayerResultCode.Success) {
			res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
			return
		}

		// 204 Even if current email is not registered (for prevent user's email detection)
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}
}
