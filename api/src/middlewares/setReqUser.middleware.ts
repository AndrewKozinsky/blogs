import { Request, Response, NextFunction } from 'express'
import { JwtService } from '../application/jwt.service'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { UsersRepository } from '../repositories/users.repository'

const jwtService = myContainer.get<JwtService>(ClassNames.JwtService)
const usersRepository = myContainer.get<UsersRepository>(ClassNames.UsersRepository)

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
