import express from 'express'
import { authRouter } from '../compositionRoot'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import requestsLimiter from '../middlewares/requestsLimitter'
import { authLoginValidation } from '../validators/auth/authLogin.validator'
import { authNewPasswordValidation } from '../validators/auth/authNewPassword.validator'
import { authPasswordRecoveryValidation } from '../validators/auth/authPasswordRecoveryValidation.validator'
import { authRegistrationValidation } from '../validators/auth/authRegistration.validator'
import { authRegistrationConfirmationValidation } from '../validators/auth/authRegistrationConfirmation.validator'
import { authRegistrationEmailResending } from '../validators/auth/authRegistrationEmailResending.validator'

function getAuthRouter() {
	const router = express.Router()

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
