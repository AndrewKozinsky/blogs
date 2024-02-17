import express, { Request, Response } from 'express'
import { config, HTTP_STATUSES } from '../config/config'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { ReqWithBody } from '../models/common'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationConfirmationDtoModel } from '../models/input/authRegistrationConfirmation.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { authService } from '../services/auth.service'
import { jwtService } from '../application/jwt.service'
import { LayerResultCode } from '../types/resultCodes'
import { authLoginValidation } from '../validators/auth/authLogin.validator'
import { authRegistrationValidation } from '../validators/auth/authRegistration.validator'
import { authRegistrationConfirmationValidation } from '../validators/auth/authRegistrationConfirmation.validator'
import { authRegistrationEmailResending } from '../validators/auth/authRegistrationEmailResending.validator'

function getAuthRouter() {
	const router = express.Router()

	// User login
	router.post(
		'/login',
		authLoginValidation(),
		async (req: ReqWithBody<AuthLoginDtoModel>, res: Response) => {
			const loginServiceRes = await authService.login(req)

			if (loginServiceRes.code === LayerResultCode.Unauthorized || !loginServiceRes.data) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
				return
			}

			res.cookie(config.refreshToken.name, loginServiceRes.data.refreshToken, {
				maxAge: config.refreshToken.lifeDurationInMs,
				httpOnly: true,
				secure: true,
			})

			res.status(HTTP_STATUSES.OK_200).send({
				accessToken: jwtService.createAccessToken(loginServiceRes.data.user.id),
			})
		},
	)

	// Generate the new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
	router.post('/refresh-token', async (req: Request, res: Response) => {
		const { newAccessToken, newRefreshToken } =
			await authService.generateAccessAndRefreshTokens(req)

		if (!newAccessToken || !newRefreshToken) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		res.cookie(config.refreshToken.name, newRefreshToken, {
			maxAge: config.refreshToken.lifeDurationInMs,
			httpOnly: true,
			secure: true,
		})

		res.status(HTTP_STATUSES.OK_200).send({
			accessToken: newAccessToken,
		})
	})

	// Registration in the system.
	// Email with confirmation code will be sent to passed email address.
	router.post(
		'/registration',
		authRegistrationValidation(),
		async (req: ReqWithBody<AuthRegistrationDtoModel>, res: Response) => {
			const regStatus = await authService.registration(req.body)

			if (regStatus.status === 'fail') {
				res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Registration email resending.
	router.post(
		'/registration-email-resending',
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
	router.post('/logout', async (req: Request, res: Response) => {
		const refreshTokenFromCookie = jwtService.getDeviceRefreshTokenFromReq(req)
		const logoutServiceRes = await authService.logout(refreshTokenFromCookie)

		if (logoutServiceRes.code === LayerResultCode.Unauthorized) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		res.clearCookie(config.refreshToken.name)
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	})

	return router
}

export default getAuthRouter
