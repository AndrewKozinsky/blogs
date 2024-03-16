import { add } from 'date-fns'
import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { HashService } from '../adapters/hash.adapter'
import { ClassNames } from '../composition/classNames'
import { UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UserServiceModel } from '../models/service/users.service.model'
import { createUniqString } from '../utils/stringUtils'

@injectable()
export class CommonService {
	@inject(ClassNames.HashService) private hashService: HashService

	// Return object which can be save in DB to create a new user
	async getCreateUserDto(
		dto: { login: string; email: string; password: string },
		isEmailConfirmed: boolean,
	): Promise<DBTypes.User> {
		const passwordHash = await this.hashService.hashString(dto.password)

		return {
			account: {
				login: dto.login,
				email: dto.email,
				password: passwordHash,
				passwordRecoveryCode: undefined,
				createdAt: new Date().toISOString(),
			},
			emailConfirmation: {
				confirmationCode: createUniqString(),
				expirationDate: add(new Date(), { hours: 0, minutes: 5 }),
				isConfirmed: isEmailConfirmed,
			},
		}
	}

	async createUser(dto: DBTypes.User) {
		const userRes = await UserModel.create(dto)
		return userRes.id
	}

	async deleteUser(userId: string): Promise<boolean> {
		if (!ObjectId.isValid(userId)) {
			return false
		}

		const result = await UserModel.deleteOne({ _id: new ObjectId(userId) })

		return result.deletedCount === 1
	}

	mapDbUserToServiceUser(DbUser: WithId<DBTypes.User>): UserServiceModel {
		return {
			id: DbUser._id.toString(),
			account: {
				login: DbUser.account.login,
				email: DbUser.account.email,
				password: DbUser.account.password,
				passwordRecoveryCode: DbUser.account.passwordRecoveryCode,
				createdAt: DbUser.account.createdAt,
			},
			emailConfirmation: {
				confirmationCode: DbUser.emailConfirmation.confirmationCode,
				expirationDate: DbUser.emailConfirmation.expirationDate,
				isConfirmed: DbUser.emailConfirmation.isConfirmed,
			},
		}
	}
}
