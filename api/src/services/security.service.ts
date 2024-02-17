import { jwtService } from '../application/jwt.service'
import DbNames from '../db/dbNames'
import { authRepository } from '../repositories/auth.repository'
import { securityRepository } from '../repositories/security.repository'
import { UserServiceModel } from '../models/service/users.service.model'
import { db } from '../db/dbService'

type TerminateSpecifiedDeviceRefreshTokenStatus = 'tokenNotFound' | 'success' | 'fail'

export const securityService = {
	async terminateAllDeviceRefreshTokensApartThis(refreshTokenStr: string) {
		const refreshToken = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)
		const { deviceId } = refreshToken!

		await securityRepository.terminateAllDeviceRefreshTokensApartThis(deviceId)
	},

	async terminateSpecifiedDeviceRefreshToken(
		deviceId: string,
		user: UserServiceModel,
	): Promise<TerminateSpecifiedDeviceRefreshTokenStatus> {
		const refreshTokenInDb = await authRepository.getRefreshTokenByDeviceId(deviceId)

		if (!refreshTokenInDb) {
			return 'tokenNotFound'
		}

		if (refreshTokenInDb.userId !== user.id) {
			return 'fail'
		}

		const isDeleted = await securityRepository.deleteRefreshTokenByDeviceId(deviceId)

		return isDeleted ? 'success' : 'fail'
	},
}
