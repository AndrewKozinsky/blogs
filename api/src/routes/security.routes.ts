import express, { Request, Response } from 'express'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { checkRefreshTokenMiddleware } from '../middlewares/checkRefreshTokenMiddleware'
import { ReqWithParams } from '../models/common'
import { securityQueryRepository } from '../repositories/security.queryRepository'
import { securityService } from '../services/security.service'

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get('/devices', checkRefreshTokenMiddleware, async (req: Request, res: Response) => {
		const refreshTokenFromCookie = jwtService.getDeviceRefreshTokenFromReq(req)

		const userDevices = await securityQueryRepository.getUserDevices(refreshTokenFromCookie)
		res.status(HTTP_STATUSES.OK_200).send(userDevices)
	})

	// Terminate all other (exclude current) device's sessions
	router.delete('/devices', checkRefreshTokenMiddleware, async (req: Request, res: Response) => {
		const refreshTokenFromCookie = jwtService.getDeviceRefreshTokenFromReq(req)
		await securityService.terminateAllDeviceRefreshTokensApartThis(refreshTokenFromCookie)

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	})

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		checkRefreshTokenMiddleware,
		async (req: ReqWithParams<{ deviceId: string }>, res: Response) => {
			const status = await securityService.terminateSpecifiedDeviceRefreshToken(
				req.params.deviceId,
				req.user!,
			)

			if (status === 'tokenNotFound') {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			if (status === 'fail') {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getSecurityRouter
