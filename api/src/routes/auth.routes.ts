import express, { Request, Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { userAuthMiddleware } from '../middlewares/userAuth.middleware'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { ReqWithBody } from '../models/common'
import { AuthRegistrationDtoModel } from '../models/input/authRegistration.input.model'
import { AuthRegistrationConfirmationDtoModel } from '../models/input/authRegistrationConfirmation.input.model'
import { AuthRegistrationEmailResendingDtoModel } from '../models/input/authRegistrationEmailResending.input.model'
import { authService } from '../services/auth.service'
import { jwtService } from '../application/jwt.service'
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
			const user = await authService.getUserByLoginOrEmailAndPassword(req.body)

			if (!user) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
				return
			}

			res.status(HTTP_STATUSES.OK_200).send({
				accessToken: jwtService.createJWT(user),
			})
		},
	)

	// Registration in the system.
	// Email with confirmation code will be send to passed email address.
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

			if (resendingStatus.status === 'fail') {
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
	router.get('/me', userAuthMiddleware, async (req: Request, res: Response) => {
		const user = authService.getCurrentUser(req.user!)
		res.status(HTTP_STATUSES.OK_200).send(user)
	})

	return router
}

export default getAuthRouter
