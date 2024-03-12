import { Request, Response, NextFunction } from 'express'
import { JwtService } from '../application/jwt.service'
import { RequestService } from '../application/request.service'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { HTTP_STATUSES } from '../config/config'
import { AuthRepository } from '../repositories/auth.repository'

const authRepository = myContainer.get<AuthRepository>(ClassNames.AuthRepository)
const jwtService = myContainer.get<JwtService>(ClassNames.JwtService)
const requestService = myContainer.get<RequestService>(ClassNames.RequestService)

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
