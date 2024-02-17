import { WithId } from 'mongodb'
import DbNames from '../db/dbNames'
import { db } from '../db/dbService'
import { DBTypes } from '../db/dbTypes'
import { GetUserDevicesOutModel, UserDeviceOutModel } from '../models/output/security.output.model'
import { authRepository } from './auth.repository'

export const securityQueryRepository = {
	async getUserDevices(refreshToken: string): Promise<GetUserDevicesOutModel> {
		const user = await authRepository.getUserByRefreshToken(refreshToken)

		const userDevices = await db
			.collection<DBTypes.DeviceToken>(DbNames.refreshTokens)
			.find({ userId: user!.id })
			.toArray()

		return userDevices.map(this.mapDbUserDeviceToOutputUserDevice)
	},

	mapDbUserDeviceToOutputUserDevice(
		DbUserRefreshToken: WithId<DBTypes.DeviceToken>,
	): UserDeviceOutModel {
		return {
			ip: DbUserRefreshToken.deviceIP, // IP address of device
			title: DbUserRefreshToken.deviceName, // Chrome 105
			lastActiveDate: DbUserRefreshToken.issuedAt.toISOString(), // Date of the last generating of refresh/access tokens
			deviceId: DbUserRefreshToken.deviceId, // Id of the connected device session
		}
	},
}
