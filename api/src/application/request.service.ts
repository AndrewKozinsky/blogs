import { Request } from 'express'
import { config } from '../config/config'

export class RequestService {
	getDeviceRefreshStrTokenFromReq(req: Request): string {
		return req.cookies[config.refreshToken.name]
	}
}
