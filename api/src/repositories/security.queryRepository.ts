import { WithId } from 'mongodb'
import DbNames from '../db/dbNames'
import { db } from '../db/dbService'
import { DBTypes } from '../db/dbTypes'
import { GetUserDevicesOutModel, UserDeviceOutModel } from '../models/output/security.output.model'

export const securityQueryRepository = {
	async getUserDevices(userId: string): Promise<GetUserDevicesOutModel> {
		const userDevices = await db
			.collection<DBTypes.RefreshToken>(DbNames.refreshTokens)
			.find({ userId })
			.toArray()

		return userDevices.map(this.mapDbUserDeviceToOutputUserDevice)
	},

	mapDbUserDeviceToOutputUserDevice(
		DbUserRefreshToken: WithId<DBTypes.RefreshToken>,
	): UserDeviceOutModel {
		return {
			ip: DbUserRefreshToken.deviceIP, // IP address of device
			title: DbUserRefreshToken.deviceName, // Chrome 105
			lastActiveDate: DbUserRefreshToken.issuedAt.toString(), // Date of the last generating of refresh/access tokens
			deviceId: DbUserRefreshToken.deviceId, // Id of the connected device session
		}
	},
}
