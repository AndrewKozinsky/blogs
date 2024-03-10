import express from 'express'
import { securityRouter } from '../compositionRoot'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'

function getSecurityRouter() {
	const router = express.Router()

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
