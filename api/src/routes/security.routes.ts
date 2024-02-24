import express, { Request, Response } from 'express'
import { jwtService } from '../application/jwt.service'
import { requestService } from '../application/request.service'
import { HTTP_STATUSES } from '../config/config'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import requestsLimiter from '../middlewares/requestsLimitter'
import { ReqWithParams } from '../models/common'
import { securityQueryRepository } from '../repositories/security.queryRepository'
import { securityService } from '../services/security.service'
import { LayerResultCode } from '../types/resultCodes'

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		async (req: Request, res: Response) => {
			const refreshTokenFromCookie = requestService.getDeviceRefreshStrTokenFromReq(req)

			const userDevices = await securityQueryRepository.getUserDevices(refreshTokenFromCookie)
			res.status(HTTP_STATUSES.OK_200).send(userDevices)
		},
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		async (req: Request, res: Response) => {
			const refreshTokenFromCookie = requestService.getDeviceRefreshStrTokenFromReq(req)
			await securityService.terminateAllDeviceRefreshTokensApartThis(refreshTokenFromCookie)

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		checkDeviceRefreshTokenMiddleware,
		async (req: ReqWithParams<{ deviceId: string }>, res: Response) => {
			const refreshTokenFromCookie = requestService.getDeviceRefreshStrTokenFromReq(req)
			const terminateDeviceRes = await securityService.terminateSpecifiedDeviceRefreshToken(
				refreshTokenFromCookie,
				req.params.deviceId,
			)

			if (terminateDeviceRes.code === LayerResultCode.NotFound) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			if (terminateDeviceRes.code === LayerResultCode.Forbidden) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getSecurityRouter
