import { Request, Response, NextFunction } from 'express'
import { jwtService, usersRepository } from '../compositionRoot'
import { HTTP_STATUSES } from '../config/config'

export async function checkAccessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.headers['authorization']

	if (!authorizationHeader) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	const token = getBearerTokenFromStr(authorizationHeader)
	if (!token) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	const userId = jwtService.getUserIdByAccessTokenStr(token)
	if (!userId) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	req.user = await usersRepository.getUserById(userId)
	next()
}

function getBearerTokenFromStr(authorizationHeader: string) {
	const [authType, token] = authorizationHeader.split(' ')

	if (authType !== 'Bearer' || !token) {
		return false
	}

	return token
}
