import { ObjectId, WithId } from 'mongodb'
import { hashService } from '../adapters/hash.adapter'
import { jwtService } from '../application/jwt.service'
import DbNames from '../db/dbNames'
import { DBTypes } from '../db/dbTypes'
import { AuthLoginDtoModel } from '../models/input/authLogin.input.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { db } from '../db/dbService'
import { commonService } from '../services/common'
import { createUniqString } from '../utils/stringUtils'

export const authRepository = {
	async getUserByRefreshToken(refreshTokenStr: string) {
		const refreshTokenData = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)

		const getDeviceRes = await db
			.collection<DBTypes.RefreshToken>(DbNames.refreshTokens)
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

	async getUserByLoginOrEmailAndPassword(loginDto: AuthLoginDtoModel) {
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

	async setNewRefreshToken(data: DBTypes.RefreshToken) {
		await db.collection(DbNames.refreshTokens).insertOne(data)
	},

	async getRefreshTokenByDeviceId(deviceId: string): Promise<null | DBTypes.RefreshToken> {
		const getTokenRes = await db
			.collection<DBTypes.RefreshToken>(DbNames.refreshTokens)
			.findOne({
				deviceId,
			})

		if (!getTokenRes) return null

		return getTokenRes
	},

	async deleteRefreshTokenByDeviceId(deviceId: string): Promise<boolean> {
		const result = await db.collection(DbNames.refreshTokens).deleteOne({ deviceId })

		return result.deletedCount === 1
	},

	async updateRefreshTokenDate(deviceId: string): Promise<boolean> {
		const result = await db
			.collection(DbNames.refreshTokens)
			.updateOne({ deviceId }, { $set: { issuedAt: new Date() } })

		return result.modifiedCount === 1
	},

	async getRefreshTokenByTokenStr(tokenStr: string): Promise<null | DBTypes.RefreshToken> {
		const refreshToken = jwtService.getRefreshTokenDataFromTokenStr(tokenStr)

		return this.getRefreshTokenByDeviceId(refreshToken!.deviceId)
	},

	async findRefreshTokenInDb(deviceId: string) {
		return await db.collection(DbNames.refreshTokens).findOne({ deviceId })
	},

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return commonService.mapDbUserToServiceUser(dbUser)
	},
}
