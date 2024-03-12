import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { RequestService } from '../application/request.service'
import { ClassNames } from '../composition/classNames'
import { HTTP_STATUSES } from '../config/config'
import { ReqWithParams } from '../models/common'
import { SecurityQueryRepository } from '../repositories/security.queryRepository'
import { SecurityService } from '../services/security.service'
import { LayerResultCode } from '../types/resultCodes'

@injectable()
export class SecurityRouter {
	@inject(ClassNames.SecurityQueryRepository)
	private securityQueryRepository: SecurityQueryRepository
	@inject(ClassNames.SecurityService) private securityService: SecurityService
	@inject(ClassNames.RequestService) private requestService: RequestService

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
