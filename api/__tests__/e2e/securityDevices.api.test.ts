// @ts-ignore
import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES, config } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { DBTypes } from '../../src/db/dbTypes'
import { createUniqString, parseCookieStringToObj } from '../../src/utils/stringUtils'
import { resetDbEveryTest } from './utils/common'
import {
	addUserByAdminRequest,
	adminAuthorizationValue,
	checkUserDeviceObj,
	checkUserObj,
	loginRequest,
	userLogin,
	userPassword,
} from './utils/utils'
import * as jwt from 'jsonwebtoken'

resetDbEveryTest()

it.skip('123', () => {
	expect(2).toBe(2)
})

/*describe('Getting all user devices', () => {
	it.skip('should forbid a request if there is not refresh token', async () => {
		await request(app).get(RouteNames.securityDevices).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})
	it.skip('should return an array of devices data if a refreshToken inside cookie is valid', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)
		const refreshTokenStr = loginRes.headers['set-cookie'][0]
		const refreshToken = refreshTokenStr.split('=')[1]

		const getUserDevicesRes = await request(app)
			.get(RouteNames.securityDevices)
			.set('Cookie', config.refreshToken.name + '=' + refreshToken)
			.expect(HTTP_STATUSES.OK_200)

		checkUserDeviceObj(getUserDevicesRes.body[0])
	})
})*/

/*describe('Terminate specified device session', () => {
	it.skip('should forbid a request from a user without a device refresh token', async () => {
		return request(app)
			.delete(RouteNames.securityDevice('999'))
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should forbid a request from a user with an expired device refresh token', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const userId = createdUserRes.body.id

		// Create expired token
		const deviceId = createUniqString()

		const expiredRefreshToken: DBTypes.DeviceToken = {
			issuedAt: new Date(),
			expirationDate: new Date(),
			deviceIP: '123',
			deviceId,
			deviceName: 'Unknown',
			userId,
		}

		await authRepository.insertDeviceRefreshToken(expiredRefreshToken)

		// Get created expired token
		const refreshToken = authRepository.getDeviceRefreshTokenByDeviceId(deviceId)

		return request(app)
			.delete(RouteNames.securityDevice('999'))
			.set('Cookie', config.refreshToken.name + '=' + refreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 404 if client tries to terminate a non existed device', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, userLogin, userPassword).expect(
			HTTP_STATUSES.OK_200,
		)
		const refreshTokenStr = loginRes.headers['set-cookie'][0]
		const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

		return request(app)
			.delete(RouteNames.securityDevice('999'))
			.set('Cookie', config.refreshToken.name + '=' + refreshTokenValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should return 403 if a client tries to terminate a device which does not belong to him', async () => {
		// Create a user 1
		const createdUser_1_Res = await addUserByAdminRequest(app)
		expect(createdUser_1_Res.status).toBe(HTTP_STATUSES.CREATED_201)

		const login_1_Res = await loginRequest(app, userLogin, userPassword).expect(
			HTTP_STATUSES.OK_200,
		)

		const deviceRefreshTokenUser_1_Str = login_1_Res.headers['set-cookie'][0]
		const deviceRefreshTokenUser_1_Value = parseCookieStringToObj(
			deviceRefreshTokenUser_1_Str,
		).cookieValue

		const deviceId = jwtService.getRefreshTokenDataFromTokenStr(
			deviceRefreshTokenUser_1_Value,
		)!.deviceId

		// Create a user 2
		const login = 'login-2'
		const password = 'password-2'
		const email = 'email-2@email.ru'

		const createdUser_2_Res = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUser_2_Res.status).toBe(HTTP_STATUSES.CREATED_201)

		const login_2_Res = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)

		const deviceRefreshTokenUser_2_Str = login_2_Res.headers['set-cookie'][0]
		const deviceRefreshTokenUser_2_Value = parseCookieStringToObj(
			deviceRefreshTokenUser_2_Str,
		).cookieValue

		return request(app)
			.delete(RouteNames.securityDevice(deviceId))
			.set('Cookie', config.refreshToken.name + '=' + deviceRefreshTokenUser_2_Value)
			.expect(HTTP_STATUSES.FORBIDDEN_403)
	})

	it.skip('should return 204 if a client tries to terminate his device', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, userLogin, userPassword).expect(
			HTTP_STATUSES.OK_200,
		)

		const deviceRefreshTokenStr = loginRes.headers['set-cookie'][0]
		const deviceRefreshTokenValue = parseCookieStringToObj(deviceRefreshTokenStr).cookieValue

		const deviceId =
			jwtService.getRefreshTokenDataFromTokenStr(deviceRefreshTokenValue)!.deviceId

		return request(app)
			.delete(RouteNames.securityDevice(deviceId))
			.set('Cookie', config.refreshToken.name + '=' + deviceRefreshTokenValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})
})*/

/*describe('Terminate this device session', () => {
	it.skip('should forbid a request from a user without a device refresh token', async () => {
		return request(app)
			.delete(RouteNames.securityDevices)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should forbid a request from a user with an expired device refresh token', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const userId = createdUserRes.body.id

		// Create expired token
		const deviceId = createUniqString()

		const expiredRefreshToken: DBTypes.DeviceToken = {
			issuedAt: new Date(),
			expirationDate: new Date(),
			deviceIP: '123',
			deviceId,
			deviceName: 'Unknown',
			userId,
		}

		await authRepository.insertDeviceRefreshToken(expiredRefreshToken)

		// Get created expired token
		const refreshToken = authRepository.getDeviceRefreshTokenByDeviceId(deviceId)

		return request(app)
			.delete(RouteNames.securityDevices)
			.set('Cookie', config.refreshToken.name + '=' + refreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 204 if a client tries to terminate current device', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, userLogin, userPassword).expect(
			HTTP_STATUSES.OK_200,
		)

		const deviceRefreshTokenStr = loginRes.headers['set-cookie'][0]
		const deviceRefreshTokenValue = parseCookieStringToObj(deviceRefreshTokenStr).cookieValue

		return request(app)
			.delete(RouteNames.securityDevices)
			.set('Cookie', config.refreshToken.name + '=' + deviceRefreshTokenValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})
})*/
