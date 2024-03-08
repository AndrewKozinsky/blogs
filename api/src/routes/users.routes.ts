import { Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { CreateUserDtoModel, GetUsersQueries } from '../models/input/users.input.model'
import { ReqWithBody, ReqWithParams, ReqWithQuery } from '../models/common'
import { UsersQueryRepository } from '../repositories/users.queryRepository'
import { UsersService } from '../services/users.service'

export class UsersRouter {
	usersQueryRepository: UsersQueryRepository

	constructor(protected usersService: UsersService) {
		this.usersQueryRepository = new UsersQueryRepository()
	}

	async getUsers(req: ReqWithQuery<GetUsersQueries>, res: Response) {
		const users = await this.usersQueryRepository.getUsers(req.query)
		res.status(HTTP_STATUSES.OK_200).send(users)
	}

	// Create new user by the admin
	async createUser(req: ReqWithBody<CreateUserDtoModel>, res: Response) {
		const createdUserId = await this.usersService.createUserByAdmin(req.body)

		const getUserRes = await this.usersQueryRepository.getUser(createdUserId)

		res.status(HTTP_STATUSES.CREATED_201).send(getUserRes)
	}

	// Delete user specified by id
	async deleteUser(req: ReqWithParams<{ userId: string }>, res: Response) {
		const userId = req.params.userId

		const isUserDeleted = await this.usersService.deleteUser(userId)

		if (!isUserDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}
}
