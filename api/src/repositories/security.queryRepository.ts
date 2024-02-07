import { WithId } from 'mongodb'
import DbNames from '../config/dbNames'
import { db } from '../db/dbService'
import { DBTypes } from '../models/db'
import { GetUserDevicesOutModel, UserDeviceOutModel } from '../models/output/security.output.model'

export const securityQueryRepository = {
	async getUserDevices(): Promise<GetUserDevicesOutModel> {
		const userDevices = await db.collection(DbNames.refreshTokens).find().toArray()

		return userDevices.map(this.mapDbUserDeviceToOutputUserDevice)
	},

	mapDbUserDeviceToOutputUserDevice(
		DbUserDevice: WithId<DBTypes.RefreshToken>,
	): UserDeviceOutModel {
		return {
			ip: DbUserDevice.deviceIP, // IP address of device
			title: DbUserDevice.deviceName, // Chrome 105
			lastActiveDate: DbUserDevice.issuedAt.toString(), // Date of the last generating of refresh/access tokens
			deviceId: DbUserDevice.deviceId, // Id of connected device session
		}
	},
}
