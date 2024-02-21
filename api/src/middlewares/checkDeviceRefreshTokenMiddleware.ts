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

		if (!refreshTokenStr || !jwtService.isRefreshTokenStrValid(refreshTokenStr)) {
			console.log(refreshTokenStr)
			throwError()
			return
		}

		// DELETE LATER !!!
		/*const deviceRefreshToken =
			await authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

		if (!jwtService.isDeviceRefreshTokenValid(deviceRefreshToken)) {
			throwError()
			return
		}*/

		next()
	} catch (err: unknown) {
		res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
	}
}

function throwError() {
	throw Error('Wrong refresh token')
}
