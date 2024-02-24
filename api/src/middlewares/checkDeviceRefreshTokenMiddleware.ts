import { Request, Response, NextFunction } from 'express'
import { jwtService } from '../application/jwt.service'
import { requestService } from '../application/request.service'
import { HTTP_STATUSES } from '../config/config'
import { authRepository } from '../repositories/auth.repository'

export async function checkDeviceRefreshTokenMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const refreshTokenStr = requestService.getDeviceRefreshStrTokenFromReq(req)

		if (!jwtService.isRefreshTokenStrValid(refreshTokenStr)) {
			throwError()
		}

		// Check if refreshTokenStr has another expiration date
		const refreshTokenStrExpirationDate = jwtService.getTokenExpirationDate(refreshTokenStr)

		const deviceRefreshToken =
			await authRepository.getDeviceRefreshTokenByTokenStr(refreshTokenStr)

		if (!refreshTokenStrExpirationDate || !deviceRefreshToken) {
			throwError()
		}

		if (
			refreshTokenStrExpirationDate!.toLocaleString() !==
			deviceRefreshToken!.expirationDate.toLocaleString()
		) {
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
