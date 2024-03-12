import express from 'express'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'
import { getUsersValidation } from '../validators/users/getUsers.validator'
import { userValidation } from '../validators/users/user.validator'
import { UsersRouter } from './users.routes'

function getUsersRouter() {
	const router = express.Router()
	const usersRouter = myContainer.get<UsersRouter>(ClassNames.UsersRouter)

	// Returns all users
	router.get(
		'/',
		setReqUserMiddleware,
		adminAuthMiddleware,
		getUsersValidation(),
		usersRouter.getUsers.bind(usersRouter),
	)

	// Create new user by the admin
	router.post(
		'/',
		setReqUserMiddleware,
		adminAuthMiddleware,
		userValidation(),
		usersRouter.createUser.bind(usersRouter),
	)

	// Delete user specified by id
	router.delete('/:userId', adminAuthMiddleware, usersRouter.deleteUser.bind(usersRouter))

	return router
}

export default getUsersRouter
