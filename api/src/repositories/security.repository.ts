import DbNames from '../db/dbNames'
import { db } from '../db/dbService'

export const securityRepository = {
	async terminateAllDeviceRefreshTokensApartThis(currentDeviceId: string) {
		const result = await db
			.collection(DbNames.refreshTokens)
			.deleteMany({ deviceId: { $ne: currentDeviceId } })

		return result.deletedCount === 1
	},

	async deleteRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await db.collection(DbNames.refreshTokens).deleteOne({ deviceId })

		return result.deletedCount === 1
	},
}
