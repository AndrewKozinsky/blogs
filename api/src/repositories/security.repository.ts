import DbNames from '../db/dbNames'
import { db } from '../db/dbService'

type TerminateSpecifiedDeviceRefreshTokenStatus = 'tokenNotFound' | 'success' | 'fail'

export const securityRepository = {
	async terminateAllDeviceRefreshTokensApartThis(currentDeviceId: string) {
		const result = await db
			.collection(DbNames.refreshTokens)
			.deleteMany({ deviceId: { $ne: currentDeviceId } })

		return result.deletedCount === 1
	},

	async deleteRefreshTokenByDeviceId(
		deviceId: string,
	): Promise<TerminateSpecifiedDeviceRefreshTokenStatus> {
		const result = await db.collection(DbNames.refreshTokens).deleteOne({ deviceId: deviceId })

		return result.deletedCount === 1 ? 'success' : 'fail'
	},
}
