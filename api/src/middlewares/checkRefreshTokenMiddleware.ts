import { Request, Response, NextFunction } from 'express'
import { loginRequest } from '../../__tests__/e2e/utils/utils'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { authRepository } from '../repositories/auth.repository'
import { usersRepository } from '../repositories/users.repository'

export async function checkRefreshTokenMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const refreshToken = jwtService.getRefreshTokenFromReqCookie(req)

		if (!refreshToken) {
			throwError()
			return
		}

		const refreshTokenInDb = await authRepository.getRefreshTokenByTokenStr(refreshToken)

		if (!jwtService.isRefreshTokenInDbValid(refreshTokenInDb)) {
			throwError()
			return
		}

		next()
	} catch (err: unknown) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
	}
}

function throwError() {
	throw Error('Wrong refresh token')
}
