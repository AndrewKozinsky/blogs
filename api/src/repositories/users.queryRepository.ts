import { injectable } from 'inversify'
import { Filter, ObjectId, WithId } from 'mongodb'
import { FilterQuery } from 'mongoose'
import { UserModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetUsersQueries } from '../models/input/users.input.model'
import {
	GetUserOutModel,
	GetUsersOutModel,
	UserOutModel,
} from '../models/output/users.output.model'

@injectable()
export class UsersQueryRepository {
	async getUsers(queries: GetUsersQueries): Promise<GetUsersOutModel> {
		const filter: FilterQuery<DBTypes.User> = {
			$or: [
				{ 'account.login': { $regex: queries.searchLoginTerm ?? '', $options: 'i' } },
				{ 'account.email': { $regex: queries.searchEmailTerm ?? '', $options: 'i' } },
			],
		}

		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'
		const sort = { [sortBy]: sortDirection }

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalUsersCount = await UserModel.countDocuments(filter)

		const pagesCount = Math.ceil(totalUsersCount / pageSize)

		const getUsersRes = await UserModel.find(filter)
			.sort(sort)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.lean()

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalUsersCount,
			items: getUsersRes.map(this.mapDbUserToOutputUser),
		}
	}

	async getUser(userId: string): Promise<null | GetUserOutModel> {
		if (!ObjectId.isValid(userId)) {
			return null
		}

		const getUserRes = await UserModel.findOne({ _id: new ObjectId(userId) }).lean()

		return getUserRes ? this.mapDbUserToOutputUser(getUserRes) : null
	}

	mapDbUserToOutputUser(DbUser: WithId<DBTypes.User>): UserOutModel {
		return {
			id: DbUser._id.toString(),
			email: DbUser.account.email,
			login: DbUser.account.login,
			createdAt: DbUser.account.createdAt,
		}
	}
}
