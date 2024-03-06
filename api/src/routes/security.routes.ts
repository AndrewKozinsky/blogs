import express, { Request, Response } from 'express'
import { RequestService } from '../application/request.service'
import { securityRouter } from '../compositionRoot'
import { HTTP_STATUSES } from '../config/config'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import { ReqWithParams } from '../models/common'
import { SecurityQueryRepository } from '../repositories/security.queryRepository'
import { SecurityService } from '../services/security.service'
import { LayerResultCode } from '../types/resultCodes'

export class SecurityRouter {
	constructor(
		private securityQueryRepository: SecurityQueryRepository,
		private securityService: SecurityService,
		private requestService: RequestService,
	) {}

	// Returns all devices with active sessions for current user
	async getUserDevices(req: Request, res: Response) {
		const refreshTokenFromCookie = this.requestService.getDeviceRefreshStrTokenFromReq(req)

		const userDevices =
			await this.securityQueryRepository.getUserDevices(refreshTokenFromCookie)
		res.status(HTTP_STATUSES.OK_200).send(userDevices)
	}

	// Terminate all other (exclude current) device's sessions
	async terminateUserDevicesExceptOne(req: Request, res: Response) {
		const refreshTokenFromCookie = this.requestService.getDeviceRefreshStrTokenFromReq(req)
		await this.securityService.terminateAllDeviceRefreshTokensApartThis(refreshTokenFromCookie)

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	// Terminate specified device session
	async terminateUserDevice(req: ReqWithParams<{ deviceId: string }>, res: Response) {
		const refreshTokenFromCookie = this.requestService.getDeviceRefreshStrTokenFromReq(req)
		const terminateDeviceRes = await this.securityService.terminateSpecifiedDeviceRefreshToken(
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
	}
}

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.getUserDevices.bind(securityRouter),
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevicesExceptOne.bind(securityRouter),
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevice.bind(securityRouter),
	)

	return router
}

export default getSecurityRouter
