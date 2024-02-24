import { DeviceTokenModel } from '../db/dbMongoose'

export const securityRepository = {
	async terminateAllDeviceRefreshTokensApartThis(currentDeviceId: string) {
		const result = await DeviceTokenModel.deleteMany({ deviceId: { $ne: currentDeviceId } })

		return result.deletedCount === 1
	},

	async deleteRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await DeviceTokenModel.deleteOne({ deviceId })

		return result.deletedCount === 1
	},
}
