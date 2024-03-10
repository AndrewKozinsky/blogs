import { Request, Response, NextFunction } from 'express'
import { jwtService, usersRepository } from '../compositionRoot'
import { HTTP_STATUSES } from '../config/config'

export async function setReqUserMiddleware(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.headers['authorization']

	if (!authorizationHeader) {
		next()
		return
	}

	const token = getBearerTokenFromStr(authorizationHeader)
	if (!token) {
		next()
		return
	}

	const userId = jwtService.getUserIdByAccessTokenStr(token)
	if (!userId) {
		next()
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
