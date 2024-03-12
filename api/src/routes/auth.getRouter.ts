import express from 'express'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import requestsLimiter from '../middlewares/requestsLimitter'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'
import { authLoginValidation } from '../validators/auth/authLogin.validator'
import { authNewPasswordValidation } from '../validators/auth/authNewPassword.validator'
import { authPasswordRecoveryValidation } from '../validators/auth/authPasswordRecoveryValidation.validator'
import { authRegistrationValidation } from '../validators/auth/authRegistration.validator'
import { authRegistrationConfirmationValidation } from '../validators/auth/authRegistrationConfirmation.validator'
import { authRegistrationEmailResending } from '../validators/auth/authRegistrationEmailResending.validator'
import { AuthRouter } from './auth.routes'

function getAuthRouter() {
	const router = express.Router()
	const authRouter = myContainer.get<AuthRouter>(ClassNames.AuthRouter)

	// User login
	router.post('/login', requestsLimiter, authLoginValidation(), authRouter.login.bind(authRouter))

	// Generate the new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
	router.post(
		'/refresh-token',
		setReqUserMiddleware,
		checkDeviceRefreshTokenMiddleware,
		authRouter.refreshToken.bind(authRouter),
	)

	// Registration in the system.
	// Email with confirmation code will be sent to passed email address.
	router.post(
		'/registration',
		requestsLimiter,
		setReqUserMiddleware,
		authRegistrationValidation(),
		authRouter.registration.bind(authRouter),
	)

	// Registration email resending.
	router.post(
		'/registration-email-resending',
		requestsLimiter,
		setReqUserMiddleware,
		authRegistrationEmailResending(),
		authRouter.registrationEmailResending.bind(authRouter),
	)

	// Confirm registration
	router.post(
		'/registration-confirmation',
		requestsLimiter,
		setReqUserMiddleware,
		authRegistrationConfirmationValidation(),
		authRouter.registrationConfirmation.bind(authRouter),
	)

	// Get information about current user
	router.get(
		'/me',
		setReqUserMiddleware,
		checkAccessTokenMiddleware,
		authRouter.getInformationAboutCurrentUser.bind(authRouter),
	)

	// In cookie client must send correct refreshToken that will be revoked
	router.post('/logout', checkDeviceRefreshTokenMiddleware, authRouter.logout.bind(authRouter))

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	router.post(
		'/password-recovery',
		requestsLimiter,
		setReqUserMiddleware,
		authPasswordRecoveryValidation(),
		authRouter.passwordRecovery.bind(authRouter),
	)

	// Confirm Password recovery
	router.post(
		'/new-password',
		requestsLimiter,
		setReqUserMiddleware,
		authNewPasswordValidation(),
		authRouter.newPassword.bind(authRouter),
	)

	return router
}

export default getAuthRouter
