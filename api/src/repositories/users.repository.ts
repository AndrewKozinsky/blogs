import { ObjectId, WithId } from 'mongodb'
import { hashService } from '../adapters/hash.adapter'
import { UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UserServiceModel } from '../models/service/users.service.model'
import { commonService } from '../services/common'

class UsersRepository {
	async getUserById(userId: string) {
		if (!ObjectId.isValid(userId)) {
			return null
		}

		const getUserRes = await UserModel.findOne({ _id: new ObjectId(userId) }).lean()

		if (!getUserRes) return null

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async getUserByPasswordRecoveryCode(passwordRecoveryCode: string) {
		const getUserRes = await UserModel.findOne({
			'account.passwordRecoveryCode': passwordRecoveryCode,
		}).lean()

		if (!getUserRes) return null

		return this.mapDbUserToServiceUser(getUserRes)
	}

	async createUser(dto: DBTypes.User) {
		return commonService.createUser(dto)
	}

	async deleteUser(userId: string): Promise<boolean> {
		return commonService.deleteUser(userId)
	}

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return commonService.mapDbUserToServiceUser(dbUser)
	}

	async setPasswordRecoveryCodeToUser(userId: string, recoveryCode: null | string) {
		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'account.passwordRecoveryCode': recoveryCode } },
		)
	}

	async setNewPasswordToUser(userId: string, newPassword: string) {
		const passwordHash = await hashService.hashString(newPassword)

		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'account.password': passwordHash } },
		)
	}
}

export const usersRepository = new UsersRepository()
