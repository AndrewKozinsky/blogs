import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUSES } from '../config/config'
import dotenv from 'dotenv'

dotenv.config()

export async function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
	if (req.headers['authorization'] !== getCorrectAuthorizationHeader()) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	next()
}

function getCorrectAuthorizationHeader() {
	const base64LoginAndPassword = Buffer.from(
		process.env.AUTH_LOGIN + ':' + process.env.AUTH_PASSWORD,
	).toString('base64')

	return 'Basic ' + base64LoginAndPassword
}
