import express, { Request, Response } from 'express'
import { RequestService } from '../application/request.service'
import { config, HTTP_STATUSES } from '../config/config'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import requestsLimiter from '../middlewares/requestsLimitter'
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
import { authLoginValidation } from '../validators/auth/authLogin.validator'
import { authNewPasswordValidation } from '../validators/auth/authNewPassword.validator'
import { authPasswordRecoveryValidation } from '../validators/auth/authPasswordRecoveryValidation.validator'
import { authRegistrationValidation } from '../validators/auth/authRegistration.validator'
import { authRegistrationConfirmationValidation } from '../validators/auth/authRegistrationConfirmation.validator'
import { authRegistrationEmailResending } from '../validators/auth/authRegistrationEmailResending.validator'

class AuthRouter {
	authService: AuthService
	requestService: RequestService
	jwtService: JwtService

	constructor() {
		this.authService = new AuthService()
		this.requestService = new RequestService()
		this.jwtService = new JwtService()
	}

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

function getAuthRouter() {
	const router = express.Router()
	const authRouter = new AuthRouter()

	// User login
	router.post('/login', requestsLimiter, authLoginValidation(), authRouter.login.bind(authRouter))

	// Generate the new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
	router.post(
		'/refresh-token',
		checkDeviceRefreshTokenMiddleware,
		authRouter.refreshToken.bind(authRouter),
	)

	// Registration in the system.
	// Email with confirmation code will be sent to passed email address.
	router.post(
		'/registration',
		requestsLimiter,
		authRegistrationValidation(),
		authRouter.registration.bind(authRouter),
	)

	// Registration email resending.
	router.post(
		'/registration-email-resending',
		requestsLimiter,
		authRegistrationEmailResending(),
		authRouter.registrationEmailResending.bind(authRouter),
	)

	// Confirm registration
	router.post(
		'/registration-confirmation',
		requestsLimiter,
		authRegistrationConfirmationValidation(),
		authRouter.registrationConfirmation.bind(authRouter),
	)

	// Get information about current user
	router.get(
		'/me',
		checkAccessTokenMiddleware,
		authRouter.getInformationAboutCurrentUser.bind(authRouter),
	)

	// In cookie client must send correct refreshToken that will be revoked
	router.post('/logout', checkDeviceRefreshTokenMiddleware, authRouter.logout.bind(authRouter))

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	router.post(
		'/password-recovery',
		requestsLimiter,
		authPasswordRecoveryValidation(),
		authRouter.passwordRecovery.bind(authRouter),
	)

	// Confirm Password recovery
	router.post(
		'/new-password',
		requestsLimiter,
		authNewPasswordValidation(),
		authRouter.newPassword.bind(authRouter),
	)

	return router
}

export default getAuthRouter
