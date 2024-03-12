import express from 'express'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'
import { SecurityRouter } from './security.routes'

function getSecurityRouter() {
	const router = express.Router()
	const securityRouter = myContainer.get<SecurityRouter>(ClassNames.SecurityRouter)

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		setReqUserMiddleware,
		checkDeviceRefreshTokenMiddleware,
		securityRouter.getUserDevices.bind(securityRouter),
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		setReqUserMiddleware,
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevicesExceptOne.bind(securityRouter),
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		setReqUserMiddleware,
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevice.bind(securityRouter),
	)

	return router
}

export default getSecurityRouter
