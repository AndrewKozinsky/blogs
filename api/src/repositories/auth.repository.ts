import { addMilliseconds } from 'date-fns'
import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { HashService } from '../adapters/hash.adapter'
import { JwtService } from '../application/jwt.service'
import { ClassNames } from '../composition/classNames'
import { config } from '../config/config'
import { DeviceTokenModel, UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { DeviceRefreshTokenServiceModel } from '../models/service/auth.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { CommonService } from '../services/common.service'
import { LayerResult, LayerResultCode } from '../types/resultCodes'
import { createUniqString } from '../utils/stringUtils'

@injectable()
export class AuthRepository {
	@inject(ClassNames.JwtService) private jwtService: JwtService
	@inject(ClassNames.HashService) private hashService: HashService
	@inject(ClassNames.CommonService) private commonService: CommonService

	async getUserByRefreshToken(refreshTokenStr: string) {
		const refreshTokenData = this.jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)

		const getDeviceRes = await DeviceTokenModel.findOne({
			deviceId: refreshTokenData!.deviceId,
		}).lean()

		if (!getDeviceRes) {
			return null
		}

		const getUserRes = await UserModel.findOne({
			_id: new ObjectId(getDeviceRes.userId),
		}).lean()

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async getUserByEmail(loginOrEmail: string) {
		const getUserRes = await UserModel.findOne({
			'account.email': loginOrEmail,
		}).lean()

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async getUserByLoginOrEmail(loginOrEmail: string) {
		const getUserRes = await UserModel.findOne({
			$or: [{ 'account.login': loginOrEmail }, { 'account.email': loginOrEmail }],
		}).lean()

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async getUserByLoginOrEmailAndPassword(loginDto: { loginOrEmail: string; password: string }) {
		const getUserRes = await UserModel.findOne({
			$or: [
				{ 'account.login': loginDto.loginOrEmail },
				{ 'account.email': loginDto.loginOrEmail },
			],
		}).lean()

		if (!getUserRes) {
			return null
		}

		const isPasswordMath = await this.hashService.compare(
			loginDto.password,
			getUserRes.account.password,
		)

		if (!isPasswordMath) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	}

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
	}

	async getUserByConfirmationCode(confirmationCode: string) {
		const getUserRes = await UserModel.findOne({
			'emailConfirmation.confirmationCode': confirmationCode,
		}).lean()

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async createUser(dto: DBTypes.User) {
		return this.commonService.createUser(dto)
	}

	async makeUserEmailConfirmed(userId: string) {
		const updateUserRes = await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'emailConfirmation.isConfirmed': true } },
		)

		return updateUserRes.modifiedCount === 1
	}

	async setNewEmailConfirmationCode(userId: string) {
		const confirmationCode = createUniqString()

		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
		)

		return confirmationCode
	}

	async deleteUser(userId: string): Promise<boolean> {
		return this.commonService.deleteUser(userId)
	}

	async insertDeviceRefreshToken(deviceRefreshToken: DBTypes.DeviceToken) {
		await DeviceTokenModel.insertMany(deviceRefreshToken)
	}

	async getDeviceRefreshTokenByDeviceId(deviceId: string): Promise<null | DBTypes.DeviceToken> {
		const getTokenRes = await DeviceTokenModel.findOne({
			deviceId,
		}).lean()

		if (!getTokenRes) return null

		return this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(getTokenRes)
	}

	async deleteDeviceRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await DeviceTokenModel.deleteOne({ deviceId })

		return result.deletedCount === 1
	}

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
	}

	async getDeviceRefreshTokenByTokenStr(tokenStr: string): Promise<null | DBTypes.DeviceToken> {
		const refreshToken = this.jwtService.getRefreshTokenDataFromTokenStr(tokenStr)

		return this.getDeviceRefreshTokenByDeviceId(refreshToken!.deviceId)
	}

	async findDeviceRefreshTokenInDb(deviceId: string) {
		return DeviceTokenModel.findOne({ deviceId }).lean()
	}

	async getUserDevicesByDeviceId(deviceId: string): Promise<LayerResult<DBTypes.DeviceToken[]>> {
		const userDevice = await DeviceTokenModel.findOne({ deviceId }).lean()

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
	}

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return this.commonService.mapDbUserToServiceUser(dbUser)
	}

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
	}
}
