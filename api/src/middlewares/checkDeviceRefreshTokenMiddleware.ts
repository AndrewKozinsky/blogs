import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { loginRequest } from '../../__tests__/e2e/utils/utils'
import { jwtService } from '../application/jwt.service'
import { HTTP_STATUSES } from '../config/config'
import { authRepository } from '../repositories/auth.repository'
import { usersRepository } from '../repositories/users.repository'

export async function checkDeviceRefreshTokenMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const refreshTokenStr = jwtService.getDeviceRefreshStrTokenFromReq(req)

		if (!jwtService.isRefreshTokenStrValid(refreshTokenStr)) {
			throwError()
		}

		// Check if refreshTokenStr has another expiration date
		const refreshTokenStrExpirationDate = jwtService.getTokenExpirationDate(refreshTokenStr)
		const deviceRefreshToken =
			await authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

		if (refreshTokenStrExpirationDate !== deviceRefreshToken!.expirationDate) {
			throwError()
		}

		next()
	} catch (err: unknown) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
	}
}

function throwError() {
	throw Error('Wrong refresh token')
}
