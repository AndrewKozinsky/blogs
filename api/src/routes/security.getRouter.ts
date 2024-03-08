import express from 'express'
import { securityRouter } from '../compositionRoot'
import { checkDeviceRefreshTokenMiddleware } from '../middlewares/checkDeviceRefreshTokenMiddleware'

function getSecurityRouter() {
	const router = express.Router()

	// Returns all devices with active sessions for current user
	router.get(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.getUserDevices.bind(securityRouter),
	)

	// Terminate all other (exclude current) device's sessions
	router.delete(
		'/devices',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevicesExceptOne.bind(securityRouter),
	)

	// Terminate specified device session
	router.delete(
		'/devices/:deviceId',
		checkDeviceRefreshTokenMiddleware,
		securityRouter.terminateUserDevice.bind(securityRouter),
	)

	return router
}

export default getSecurityRouter
