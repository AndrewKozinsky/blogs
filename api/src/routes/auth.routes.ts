import express, { Request, Response } from 'express'
import { requestService } from '../application/request.service'
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
import { authService } from '../services/auth.service'
import { jwtService } from '../application/jwt.service'
import { LayerResultCode } from '../types/resultCodes'
import { authLoginValidation } from '../validators/auth/authLogin.validator'
import { authNewPasswordValidation } from '../validators/auth/authNewPassword.validator'
import { authPasswordRecoveryValidation } from '../validators/auth/authPasswordRecoveryValidation.validator'
import { authRegistrationValidation } from '../validators/auth/authRegistration.validator'
import { authRegistrationConfirmationValidation } from '../validators/auth/authRegistrationConfirmation.validator'
import { authRegistrationEmailResending } from '../validators/auth/authRegistrationEmailResending.validator'

function getAuthRouter() {
	const router = express.Router()

	// User login
	router.post(
		'/login',
		requestsLimiter,
		authLoginValidation(),
		async (req: ReqWithBody<AuthLoginDtoModel>, res: Response) => {
			const loginServiceRes = await authService.login(req)

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
				accessToken: jwtService.createAccessTokenStr(loginServiceRes.data.user.id),
			})
		},
	)

	// Generate the new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
	router.post(
		'/refresh-token',
		checkDeviceRefreshTokenMiddleware,
		async (req: Request, res: Response) => {
			const generateTokensRes = await authService.refreshToken(req)

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
		},
	)

	// Registration in the system.
	// Email with confirmation code will be sent to passed email address.
	router.post(
		'/registration',
		requestsLimiter,
		authRegistrationValidation(),
		async (req: ReqWithBody<AuthRegistrationDtoModel>, res: Response) => {
			const regStatus = await authService.registration(req.body)

			if (regStatus.code === LayerResultCode.BadRequest) {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Registration email resending.
	router.post(
		'/registration-email-resending',
		requestsLimiter,
		authRegistrationEmailResending(),
		async (req: ReqWithBody<AuthRegistrationEmailResendingDtoModel>, res: Response) => {
			const resendingStatus = await authService.resendEmailConfirmationCode(req.body)

			if (resendingStatus.code === LayerResultCode.BadRequest) {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Confirm registration
	router.post(
		'/registration-confirmation',
		requestsLimiter,
		authRegistrationConfirmationValidation(),
		async (req: ReqWithBody<AuthRegistrationConfirmationDtoModel>, res: Response) => {
			const confirmationStatus = await authService.confirmEmail(req.body.code)

			if (confirmationStatus.status === 'fail') {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Get information about current user
	router.get('/me', checkAccessTokenMiddleware, async (req: Request, res: Response) => {
		const user = authService.getCurrentUser(req.user!)
		res.status(HTTP_STATUSES.OK_200).send(user)
	})

	// In cookie client must send correct refreshToken that will be revoked
	router.post(
		'/logout',
		checkDeviceRefreshTokenMiddleware,
		async (req: Request, res: Response) => {
			const refreshTokenFromCookie = requestService.getDeviceRefreshStrTokenFromReq(req)
			const logoutServiceRes = await authService.logout(refreshTokenFromCookie)

			if (logoutServiceRes.code === LayerResultCode.Unauthorized) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
				return
			}

			res.clearCookie(config.refreshToken.name)
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	router.post(
		'/password-recovery',
		requestsLimiter,
		authPasswordRecoveryValidation(),
		async (req: ReqWithBody<AuthPasswordRecoveryDtoModel>, res: Response) => {
			const passwordRecoveryServiceRes = await authService.passwordRecovery(req.body.email)

			if (passwordRecoveryServiceRes.code !== LayerResultCode.Success) {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			// 204 Even if current email is not registered (for prevent user's email detection)
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Confirm Password recovery
	router.post(
		'/new-password',
		requestsLimiter,
		authNewPasswordValidation(),
		async (req: ReqWithBody<AuthNewPasswordDtoModel>, res: Response) => {
			const passwordRecoveryServiceRes = await authService.newPassword(
				req.body.recoveryCode,
				req.body.newPassword,
			)

			if (passwordRecoveryServiceRes.code !== LayerResultCode.Success) {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			// 204 Even if current email is not registered (for prevent user's email detection)
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getAuthRouter
