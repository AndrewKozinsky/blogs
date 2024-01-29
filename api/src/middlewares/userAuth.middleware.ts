import { Request, Response, NextFunction } from 'express'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { usersRepository } from '../repositories/users.repository'

export async function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.headers['authorization']

	if (!authorizationHeader) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
		return
	}

	const token = authorizationHeader.split(' ')[1]

	const userId = jwtService.getUserIdByToken(token)

	if (userId) {
		req.user = await usersRepository.getUserById(userId)
		next()
		return
	}

	res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
}
