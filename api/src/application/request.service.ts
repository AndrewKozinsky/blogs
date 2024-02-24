import { Request } from 'express'
import { config } from '../config/config'

export const requestService = {
	getDeviceRefreshStrTokenFromReq(req: Request): string {
		return req.cookies[config.refreshToken.name]
	},
}
