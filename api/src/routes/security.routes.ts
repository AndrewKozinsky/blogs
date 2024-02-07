import express, { Request, Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { ReqWithParams } from '../models/common'
import { securityQueryRepository } from '../repositories/security.queryRepository'
import { securityRepository } from '../repositories/security.repository'
import { checkRefreshTokenInCookieValidation } from '../validators/security/checkRefreshTokenInCookie.validator'

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		checkRefreshTokenInCookieValidation,
		async (req: Request, res: Response) => {
			const userDevices = await securityQueryRepository.getUserDevices()

			res.status(HTTP_STATUSES.OK_200).send(userDevices)
		},
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		checkRefreshTokenInCookieValidation,
		async (req: Request, res: Response) => {
			await securityRepository.terminateAllDeviceRefreshTokensApartThis()

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		checkRefreshTokenInCookieValidation,
		async (req: ReqWithParams<{ deviceId: string }>, res: Response) => {
			await securityRepository.terminateSpecifiedDeviceRefreshToken(req.params.deviceId)

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getSecurityRouter
