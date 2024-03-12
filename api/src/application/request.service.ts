import { Request } from 'express'
import { injectable } from 'inversify'
import { config } from '../config/config'

@injectable()
export class RequestService {
	getDeviceRefreshStrTokenFromReq(req: Request): string {
		return req.cookies[config.refreshToken.name]
	}
}
