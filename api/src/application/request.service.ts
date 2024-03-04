import { Request } from 'express'
import { config } from '../config/config'

class RequestService {
	getDeviceRefreshStrTokenFromReq(req: Request): string {
		return req.cookies[config.refreshToken.name]
	}
}
export const requestService = new RequestService()
