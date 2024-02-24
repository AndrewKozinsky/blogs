import { addMilliseconds } from 'date-fns'
import { ObjectId, WithId } from 'mongodb'
import { hashService } from '../adapters/hash.adapter'
import { jwtService } from '../application/jwt.service'
import { config } from '../config/config'
import { DeviceTokenModel, UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { DeviceRefreshTokenServiceModel } from '../models/service/auth.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { commonService } from '../services/common'
import { LayerResult, LayerResultCode } from '../types/resultCodes'
import { createUniqString } from '../utils/stringUtils'

export const authRepository = {
	async getUserByRefreshToken(refreshTokenStr: string) {
		const refreshTokenData = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)

		const getDeviceRes = await DeviceTokenModel.findOne({
			deviceId: refreshTokenData!.deviceId,
		})

		if (!getDeviceRes) {
			return null
		}

		const getUserRes = await UserModel.findOne({
			_id: new ObjectId(getDeviceRes.userId),
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByEmail(loginOrEmail: string) {
		const getUserRes = await UserModel.findOne({
			'account.email': loginOrEmail,
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByLoginOrEmail(loginOrEmail: string) {
		const getUserRes = await UserModel.findOne({
			$or: [{ 'account.login': loginOrEmail }, { 'account.email': loginOrEmail }],
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByLoginOrEmailAndPassword(loginDto: { loginOrEmail: string; password: string }) {
		const getUserRes = await UserModel.findOne({
			$or: [
				{ 'account.login': loginDto.loginOrEmail },
				{ 'account.email': loginDto.loginOrEmail },
			],
		})

		if (!getUserRes) {
			return null
		}

		const isPasswordMath = await hashService.compare(
			loginDto.password,
			getUserRes.account.password,
		)

		if (!isPasswordMath) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getConfirmedUserByLoginOrEmailAndPassword(loginDto: {
		loginOrEmail: string
		password: string
	}): Promise<LayerResult<UserServiceModel>> {
		const user = await this.getUserByLoginOrEmailAndPassword(loginDto)

		if (!user || !user.emailConfirmation.isConfirmed) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		return {
			code: LayerResultCode.Success,
			data: user,
		}
	},

	async getUserByConfirmationCode(confirmationCode: string) {
		const getUserRes = await UserModel.findOne({
			'emailConfirmation.confirmationCode': confirmationCode,
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async createUser(dto: DBTypes.User) {
		return commonService.createUser(dto)
	},

	async makeUserEmailConfirmed(userId: string) {
		const updateUserRes = await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'emailConfirmation.isConfirmed': true } },
		)

		return updateUserRes.modifiedCount === 1
	},

	async setNewEmailConfirmationCode(userId: string) {
		const confirmationCode = createUniqString()

		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
		)

		return confirmationCode
	},

	async deleteUser(userId: string): Promise<boolean> {
		return commonService.deleteUser(userId)
	},

	async insertDeviceRefreshToken(deviceRefreshToken: DBTypes.DeviceToken) {
		await DeviceTokenModel.insertMany(deviceRefreshToken)
	},

	async getDeviceRefreshTokenByDeviceId(deviceId: string): Promise<null | DBTypes.DeviceToken> {
		const getTokenRes = await DeviceTokenModel.findOne({
			deviceId,
		})

		if (!getTokenRes) return null

		return this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(getTokenRes)
	},

	async deleteDeviceRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await DeviceTokenModel.deleteOne({ deviceId })

		return result.deletedCount === 1
	},

	async updateDeviceRefreshTokenDate(deviceId: string): Promise<boolean> {
		const result = await DeviceTokenModel.updateOne(
			{ deviceId },
			{
				$set: {
					issuedAt: new Date(),
					expirationDate: addMilliseconds(
						new Date(),
						config.refreshToken.lifeDurationInMs,
					),
				},
			},
		)

		return result.modifiedCount === 1
	},

	async getDeviceRefreshTokenByTokenStr(tokenStr: string): Promise<null | DBTypes.DeviceToken> {
		const refreshToken = jwtService.getRefreshTokenDataFromTokenStr(tokenStr)

		return this.getDeviceRefreshTokenByDeviceId(refreshToken!.deviceId)
	},

	async findDeviceRefreshTokenInDb(deviceId: string) {
		return DeviceTokenModel.findOne({ deviceId })
	},

	async getUserDevicesByDeviceId(deviceId: string): Promise<LayerResult<DBTypes.DeviceToken[]>> {
		const userDevice = await DeviceTokenModel.findOne({ deviceId })

		if (!userDevice) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		const userDevices = await DeviceTokenModel.find({ userId: userDevice.userId }).lean()

		if (!userDevices) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		return {
			code: LayerResultCode.Success,
			data: userDevices.map(this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken),
		}
	},

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return commonService.mapDbUserToServiceUser(dbUser)
	},

	mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(
		dbDevice: WithId<DBTypes.DeviceToken>,
	): DeviceRefreshTokenServiceModel {
		return {
			id: dbDevice._id.toString(),
			issuedAt: dbDevice.issuedAt,
			expirationDate: dbDevice.expirationDate,
			deviceIP: dbDevice.deviceIP,
			deviceId: dbDevice.deviceId,
			deviceName: dbDevice.deviceName,
			userId: dbDevice.userId,
		}
	},
}
