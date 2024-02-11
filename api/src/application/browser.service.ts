import { Request } from 'express'
import browser from 'browser-detect'

export const browserService = {
	// Returns client's device IP
	getClientIP(req: Request): string {
		return req.header('x-forwarded-for') || req.socket.remoteAddress || 'unknown'
	},

	// Returns client's device name
	getClientName(req: Request): string {
		const browserInfo = browser(req.headers['user-agent'])

		return browserInfo.name + ' ' + browserInfo.version
	},
}
