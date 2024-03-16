import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { HashService } from '../adapters/hash.adapter'
import { ClassNames } from '../composition/classNames'
import { UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UserServiceModel } from '../models/service/users.service.model'
import { CommonService } from '../services/common.service'

@injectable()
export class UsersRepository {
	@inject(ClassNames.CommentLikesRepository) public hashService: HashService
	@inject(ClassNames.CommonService) public commonService: CommonService

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
		return this.commonService.createUser(dto)
	}

	async deleteUser(userId: string): Promise<boolean> {
		return this.commonService.deleteUser(userId)
	}

	mapDbUserToServiceUser(dbUser: WithId<DBTypes.User>): UserServiceModel {
		return this.commonService.mapDbUserToServiceUser(dbUser)
	}

	async setPasswordRecoveryCodeToUser(userId: string, recoveryCode: null | string) {
		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'account.passwordRecoveryCode': recoveryCode } },
		)
	}

	async setNewPasswordToUser(userId: string, newPassword: string) {
		const passwordHash = await this.hashService.hashString(newPassword)

		await UserModel.updateOne(
			{ _id: new ObjectId(userId) },
			{ $set: { 'account.password': passwordHash } },
		)
	}
}
