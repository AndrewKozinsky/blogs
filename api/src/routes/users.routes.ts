import express, { Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import { CreateUserDtoModel, GetUsersQueries } from '../models/input/users.input.model'
import { ReqWithBody, ReqWithParams, ReqWithQuery } from '../models/common'
import { UsersQueryRepository } from '../repositories/users.queryRepository'
import { UsersService } from '../services/users.service'
import { getUsersValidation } from '../validators/users/getUsers.validator'
import { userValidation } from '../validators/users/user.validator'

class UsersRouter {
	usersService: UsersService
	usersQueryRepository: UsersQueryRepository

	constructor() {
		this.usersService = new UsersService()
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

function getUsersRouter() {
	const router = express.Router()
	const usersRouter = new UsersRouter()

	// Returns all users
	router.get(
		'/',
		adminAuthMiddleware,
		getUsersValidation(),
		usersRouter.getUsers.bind(usersRouter),
	)

	// Create new user by the admin
	router.post(
		'/',
		adminAuthMiddleware,
		userValidation(),
		usersRouter.createUser.bind(usersRouter),
	)

	// Delete user specified by id
	router.delete('/:userId', adminAuthMiddleware, usersRouter.deleteUser.bind(usersRouter))

	return router
}

export default getUsersRouter
