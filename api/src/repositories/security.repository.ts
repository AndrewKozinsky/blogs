import DbNames from '../config/dbNames'
import { db } from '../db/dbService'
import { UserServiceModel } from '../models/service/users.service.model'
import { authRepository } from './auth.repository'

type TerminateSpecifiedDeviceRefreshTokenStatus = 'tokenNotFound' | 'success' | 'fail'

export const securityRepository = {
	async terminateAllDeviceRefreshTokensApartThis(currentDeviceId: string) {
		const result = await db
			.collection(DbNames.refreshTokens)
			.deleteMany({ deviceId: { $ne: currentDeviceId } })

		return result.deletedCount === 1
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

		const result = await db.collection(DbNames.refreshTokens).deleteOne({ deviceId: deviceId })

		return result.deletedCount === 1 ? 'success' : 'fail'
	},
}
