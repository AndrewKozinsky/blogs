import { add } from 'date-fns'
import { ObjectId, WithId } from 'mongodb'
import { hashService } from '../adapters/hash.adapter'
import { UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UserServiceModel } from '../models/service/users.service.model'
import { createUniqString } from '../utils/stringUtils'

export const commonService = {
	// Return object which can be save in DB to create a new user
	async getCreateUserDto(
		dto: { login: string; email: string; password: string },
		isEmailConfirmed: boolean,
	): Promise<DBTypes.User> {
		const passwordSalt = await hashService.generateSalt()
		const passwordHash = await hashService.generateHash(dto.password, passwordSalt)

		return {
			account: {
				login: dto.login,
				email: dto.email,
				password: passwordHash,
				passwordRecoveryCode: null,
				createdAt: new Date().toISOString(),
			},
			emailConfirmation: {
				confirmationCode: createUniqString(),
				expirationDate: add(new Date(), { hours: 0, minutes: 5 }),
				isConfirmed: isEmailConfirmed,
			},
		}
	},

	async createUser(dto: DBTypes.User) {
		const userRes = await UserModel.create(dto)
		return userRes.id
	},

	async deleteUser(userId: string): Promise<boolean> {
		if (!ObjectId.isValid(userId)) {
			return false
		}

		const result = await UserModel.deleteOne({ _id: new ObjectId(userId) })

		return result.deletedCount === 1
	},

	mapDbUserToServiceUser(DbUser: WithId<DBTypes.User>): UserServiceModel {
		return {
			id: DbUser._id.toString(),
			account: {
				login: DbUser.account.login,
				email: DbUser.account.email,
				password: DbUser.account.password,
				createdAt: DbUser.account.createdAt,
			},
			emailConfirmation: {
				confirmationCode: DbUser.emailConfirmation.confirmationCode,
				expirationDate: DbUser.emailConfirmation.expirationDate,
				isConfirmed: DbUser.emailConfirmation.isConfirmed,
			},
		}
	},
}
