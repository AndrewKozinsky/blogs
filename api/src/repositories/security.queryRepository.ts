import { inject, injectable } from 'inversify'
import { WithId } from 'mongodb'
import { ClassNames } from '../composition/classNames'
import { DeviceTokenModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetUserDevicesOutModel, UserDeviceOutModel } from '../models/output/security.output.model'
import { AuthRepository } from './auth.repository'

@injectable()
export class SecurityQueryRepository {
	@inject(ClassNames.CommentLikesRepository) private authRepository: AuthRepository

	async getUserDevices(refreshToken: string): Promise<GetUserDevicesOutModel> {
		const user = await this.authRepository.getUserByRefreshToken(refreshToken)

		const userDevices = await DeviceTokenModel.find({ userId: user!.id }).lean()

		return userDevices.map(this.mapDbUserDeviceToOutputUserDevice)
	}

	mapDbUserDeviceToOutputUserDevice(
		DbUserRefreshToken: WithId<DBTypes.DeviceToken>,
	): UserDeviceOutModel {
		return {
			ip: DbUserRefreshToken.deviceIP, // IP address of device
			title: DbUserRefreshToken.deviceName, // Chrome 105
			lastActiveDate: DbUserRefreshToken.issuedAt.toISOString(), // Date of the last generating of refresh/access tokens
			deviceId: DbUserRefreshToken.deviceId, // Id of the connected device session
		}
	}
}
