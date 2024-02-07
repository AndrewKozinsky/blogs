import express, { Request, Response } from 'express'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { userAuthMiddleware } from '../middlewares/userAuth.middleware'
import { ReqWithParams } from '../models/common'
import { securityQueryRepository } from '../repositories/security.queryRepository'
import { securityRepository } from '../repositories/security.repository'
import { securityService } from '../services/security.service'
import { checkRefreshTokenInCookieValidation } from '../validators/security/checkRefreshTokenInCookie.validator'

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		userAuthMiddleware,
		checkRefreshTokenInCookieValidation,
		async (req: Request, res: Response) => {
			const userDevices = await securityQueryRepository.getUserDevices()

			res.status(HTTP_STATUSES.OK_200).send(userDevices)
		},
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		userAuthMiddleware,
		checkRefreshTokenInCookieValidation,
		async (req: Request, res: Response) => {
			const refreshTokenFromCookie = jwtService.getRefreshTokenFromReqCookie(req)
			await securityService.terminateAllDeviceRefreshTokensApartThis(refreshTokenFromCookie)

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		userAuthMiddleware,
		checkRefreshTokenInCookieValidation,
		async (req: ReqWithParams<{ deviceId: string }>, res: Response) => {
			const status = await securityRepository.terminateSpecifiedDeviceRefreshToken(
				req.params.deviceId,
				req.user!,
			)

			if (status === 'tokenNotFound') {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			}

			if (status === 'fail') {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getSecurityRouter
