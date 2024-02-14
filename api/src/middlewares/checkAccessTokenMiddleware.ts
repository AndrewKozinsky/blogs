import { Request, Response, NextFunction } from 'express'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { usersRepository } from '../repositories/users.repository'

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

	const userId = jwtService.getUserIdByToken(token)
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
