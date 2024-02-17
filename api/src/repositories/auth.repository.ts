import { ObjectId, WithId } from 'mongodb'
import { hashService } from '../adapters/hash.adapter'
import { jwtService } from '../application/jwt.service'
import DbNames from '../db/dbNames'
import { DBTypes } from '../db/dbTypes'
import { UserServiceModel } from '../models/service/users.service.model'
import { db } from '../db/dbService'
import { commonService } from '../services/common'
import { LayerResult, LayerResultCode } from '../types/resultCodes'
import { createUniqString } from '../utils/stringUtils'

export const authRepository = {
	async getUserByRefreshToken(refreshTokenStr: string) {
		const refreshTokenData = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)

		const getDeviceRes = await db
			.collection<DBTypes.DeviceToken>(DbNames.refreshTokens)
			.findOne({
				deviceId: refreshTokenData!.deviceId,
			})

		if (!getDeviceRes) {
			return null
		}

		const getUserRes = await db.collection<DBTypes.User>(DbNames.users).findOne({
			_id: new ObjectId(getDeviceRes.userId),
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByEmail(loginOrEmail: string) {
		const getUserRes = await db.collection<DBTypes.User>(DbNames.users).findOne({
			'account.email': loginOrEmail,
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByLoginOrEmail(loginOrEmail: string) {
		const getUserRes = await db.collection<DBTypes.User>(DbNames.users).findOne({
			$or: [{ 'account.login': loginOrEmail }, { 'account.email': loginOrEmail }],
		})

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async getUserByLoginOrEmailAndPassword(loginDto: { loginOrEmail: string; password: string }) {
		const getUserRes = await db.collection<DBTypes.User>(DbNames.users).findOne({
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
		const getUserRes = await db
			.collection<DBTypes.User>(DbNames.users)
			.findOne({ 'emailConfirmation.confirmationCode': confirmationCode })

		if (!getUserRes) {
			return null
		}

		return this.mapDbUserToServiceUser(getUserRes)
	},

	async createUser(dto: DBTypes.User) {
		return commonService.createUser(dto)
	},

	async makeUserEmailConfirmed(userId: string) {
		const updateUserRes = await db
			.collection(DbNames.users)
			.updateOne(
				{ _id: new ObjectId(userId) },
				{ $set: { 'emailConfirmation.isConfirmed': true } },
			)

		return updateUserRes.modifiedCount === 1
	},

	async setNewEmailConfirmationCode(userId: string) {
		const confirmationCode = createUniqString()

		await db
			.collection(DbNames.users)
			.updateOne(
				{ _id: new ObjectId(userId) },
				{ $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
			)

		return confirmationCode
	},

	async deleteUser(userId: string): Promise<boolean> {
		return commonService.deleteUser(userId)
	},

	async setNewRefreshToken(data: DBTypes.DeviceToken) {
		await db.collection(DbNames.refreshTokens).insertOne(data)
	},

	async getDeviceRefreshTokenByDeviceId(deviceId: string): Promise<null | DBTypes.DeviceToken> {
		const getTokenRes = await db
			.collection<DBTypes.DeviceToken>(DbNames.refreshTokens)
			.findOne({
				deviceId,
			})

		if (!getTokenRes) return null

		return getTokenRes
	},

	async deleteDeviceRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await db.collection(DbNames.refreshTokens).deleteOne({ deviceId })

		return result.deletedCount === 1
	},

	async updateDeviceRefreshTokenDate(deviceId: string): Promise<boolean> {
		const result = await db
			.collection(DbNames.refreshTokens)
			.updateOne({ deviceId }, { $set: { issuedAt: new Date() } })

		return result.modifiedCount === 1
	},

	async getDeviceRefreshTokenByTokenStr(tokenStr: string): Promise<null | DBTypes.DeviceToken> {
		const refreshToken = jwtService.getRefreshTokenDataFromTokenStr(tokenStr)

		return this.getDeviceRefreshTokenByDeviceId(refreshToken!.deviceId)
	},

	async findDeviceRefreshTokenInDb(deviceId: string) {
		return await db.collection(DbNames.refreshTokens).findOne({ deviceId })
	},

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return commonService.mapDbUserToServiceUser(dbUser)
	},
}
