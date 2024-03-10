import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUSES } from '../config/config'

export async function checkAccessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.user) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	next()
}
