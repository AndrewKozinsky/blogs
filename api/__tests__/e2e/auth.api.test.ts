import * as jwt from 'jsonwebtoken'
// @ts-ignore
import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES, config } from '../../src/config/config'
import { DBTypes } from '../../src/db/dbTypes'
import RouteNames from '../../src/config/routeNames'
import { wait } from '../../src/utils/promise'
import { createUniqString, parseCookieStringToObj } from '../../src/utils/stringUtils'
import { resetDbEveryTest } from './utils/common'
import {
	addUserByAdminRequest,
	adminAuthorizationValue,
	loginRequest,
	userEmail,
} from './utils/utils'

resetDbEveryTest()

it.skip('123', async () => {
	expect(2).toBe(2)
})

/*describe('Login user', () => {
	it.skip('should return 400 if to pass wrong dto', async () => {
		const loginRes = await request(app)
			.post(RouteNames.authLogin)
			.send({ loginOrEmail: '', password: 'password' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(loginRes.body.errorsMessages)).toBe('[object Array]')
		expect(loginRes.body.errorsMessages.length).toBe(1)
		expect(loginRes.body.errorsMessages[0].field).toBe('loginOrEmail')
	})

	it.skip('should return 401 if the login is wrong', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		await request(app)
			.post(RouteNames.authLogin)
			.send({ loginOrEmail: login + 'wrong', password })
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 401 if the password is wrong', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		await request(app)
			.post(RouteNames.authLogin)
			.send({ loginOrEmail: login, password: password + 'wrong' })
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 401 if user email is not verified', async () => {
		const login = 'login_new'
		const password = 'password_new'
		const email = 'email@email.ru'

		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login, password, email })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await loginRequest(app, login, password).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 200 and object with token and JWT refreshToken in cookie if the DTO is correct and user has verified email', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)

		// --- AccessToken
		const rightAccessToken = jwt.sign({ userId: createdUserRes.body.id }, config.JWT_SECRET, {
			expiresIn: config.accessToken.lifeDurationInMs / 1000 + 's',
		})
		expect(loginRes.body.accessToken).toBe(rightAccessToken)

		// --- RefreshToken

		const refreshTokenStr = loginRes.headers['set-cookie'][0]
		const refreshToken = parseCookieStringToObj(refreshTokenStr)

		expect(refreshToken.cookieName).toBe('refreshToken')
		expect(refreshToken.HttpOnly).toBe(true)
		expect(refreshToken.Secure).toBe(true)
		expect(refreshToken['Max-Age']).toBe(config.refreshToken.lifeDurationInMs / 1000)
	})

	it.skip('should return 429 if too many requests were made', async () => {
		for (let i = 1; i <= config.reqLimit.max; i++) {
			await request(app)
				.post(RouteNames.authLogin)
				.send({ loginOrEmail: '', password: '' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		}

		await request(app).post(RouteNames.authLogin).expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)

		await wait(config.reqLimit.durationInMs)

		await request(app)
			.post(RouteNames.authLogin)
			.send({ loginOrEmail: '', password: '' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})
})*/

/*describe('Refresh token', () => {
	it.skip('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
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

		await request(app)
			.post(RouteNames.authRefreshToken)
			.set('Cookie', config.refreshToken.name + '=' + refreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)
		const refreshTokenStr = loginRes.headers['set-cookie'][0]
		const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

		const refreshTokenRes = await request(app)
			.post(RouteNames.authRefreshToken)
			.set('Cookie', config.refreshToken.name + '=' + refreshTokenValue)
			.expect(HTTP_STATUSES.OK_200)

		const newRefreshTokenStr = refreshTokenRes.headers['set-cookie'][0]
		const newRefreshTokenObj = parseCookieStringToObj(newRefreshTokenStr)
		expect(newRefreshTokenObj['Max-Age']).toBe(config.refreshToken.lifeDurationInMs / 1000)
		expect(newRefreshTokenObj.Secure).toBe(true)
		expect(newRefreshTokenObj.HttpOnly).toBe(true)
	})
})*/

/*describe('Register user', () => {
	it.skip('should return 400 if dto has incorrect values', async () => {
		const registrationRes = await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: '', password: '', email: 'wrong-email.com' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(registrationRes.body.errorsMessages)).toBe('[object Array]')
		expect(registrationRes.body.errorsMessages.length).toBe(3)
	})

	it.skip('should return 400 if the user with the given email already exists', async () => {
		const email = 'email@email.com'

		await addUserByAdminRequest(app, { login: 'login', password: 'password', email })

		const registrationRes = await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: 'login_new', password: 'password_new', email })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(registrationRes.body.errorsMessages)).toBe('[object Array]')
		expect(registrationRes.body.errorsMessages.length).toBe(1)
		expect(registrationRes.body.errorsMessages[0].field).toBe('email')
	})

	it.skip('should return 204 if passed correct dto', async () => {
		const email = 'email@email.com'

		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: 'login_new', password: 'password_new', email })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const allUsers = await request(app)
			.get(RouteNames.users)
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.OK_200)

		expect(allUsers.body.items.length).toBe(1)
	})

	it.skip('should return 429 if too many requests were made', async () => {
		for (let i = 1; i <= config.reqLimit.max; i++) {
			await request(app)
				.post(RouteNames.authRegistration)
				.send({ login: '', password: '', email: '' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		}

		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: '', password: '', email: '' })
			.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)

		await wait(config.reqLimit.durationInMs)

		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: '', password: '', email: '' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})
})*/

/*describe('Registration confirmation', () => {
	it.skip('should return 400 if the request has wrong dto', async () => {
		const regConfirmRes = await request(app)
			.post(RouteNames.authRegistrationConfirmation)
			.send({ code: '' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(regConfirmRes.body.errorsMessages)).toBe('[object Array]')
		expect(regConfirmRes.body.errorsMessages.length).toBe(1)
	})

	it.skip('should return 400 if there is not user with given confirmation code', async () => {
		await request(app)
			.post(RouteNames.authRegistrationConfirmation)
			.send({ code: 'e18ad1ac-18ad-4dc9-80d9-28d60390e224' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 204 if passed right confirmation code', async () => {
		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: 'login_new', password: 'password_new', email: 'email@email.com' })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const allUsers = await request(app)
			.get(RouteNames.users)
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.OK_200)
		const userId = allUsers.body.items[0].id

		const fullUserData = await usersRepository.getUserById(userId)
		const confirmationCode = fullUserData!.emailConfirmation.confirmationCode

		await request(app)
			.post(RouteNames.authRegistrationConfirmation)
			.send({ code: confirmationCode })
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})

	it.skip('should return 429 if too many requests were made', async () => {
		for (let i = 1; i <= config.reqLimit.max; i++) {
			await request(app)
				.post(RouteNames.authRegistrationConfirmation)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		}

		await request(app)
			.post(RouteNames.authRegistrationConfirmation)
			.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)

		await wait(config.reqLimit.durationInMs)

		await request(app)
			.post(RouteNames.authRegistrationConfirmation)
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})
})*/

/*describe('Resending email confirmation code', () => {
	it.skip('should return 400 if dto has incorrect values', async () => {
		const registrationRes = await request(app)
			.post(RouteNames.authRegistrationEmailResending)
			.send({ email: 'wrong-email.com' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(registrationRes.body.errorsMessages)).toBe('[object Array]')
		expect(registrationRes.body.errorsMessages.length).toBe(1)
	})

	it.skip('should return 400 if email in dto is not exists', async () => {
		await request(app)
			.post(RouteNames.authRegistrationEmailResending)
			.send({ email: 'my@email.com' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 204 if passed correct dto', async () => {
		const email = 'email@email.com'

		await request(app)
			.post(RouteNames.authRegistration)
			.send({ login: 'login_new', password: 'password_new', email })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await request(app)
			.post(RouteNames.authRegistrationEmailResending)
			.send({ email })
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})

	it.skip('should return 429 if too many requests were made', async () => {
		for (let i = 1; i <= config.reqLimit.max; i++) {
			await request(app)
				.post(RouteNames.authRegistrationEmailResending)
				.send({ email: '' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		}

		await request(app)
			.post(RouteNames.authRegistrationEmailResending)
			.send({ email: '' })
			.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)

		await wait(config.reqLimit.durationInMs)

		await request(app)
			.post(RouteNames.authRegistrationEmailResending)
			.send({ email: '' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})
})*/

/*describe('Get current user', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).post(RouteNames.blogs).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 200 and user data if the DTO is correct', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)

		const authMeRes = await request(app)
			.get(RouteNames.authMe)
			.set('authorization', 'Bearer ' + loginRes.body.accessToken)
			.expect(HTTP_STATUSES.OK_200)

		expect(authMeRes.body.email).toBe(email)
		expect(authMeRes.body.login).toBe(login)
		expect(authMeRes.body.userId).toBe(createdUserRes.body.id)
	})
})*/

/*describe('Logout', () => {
	it.skip('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
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

		await request(app)
			.post(RouteNames.authLogout)
			.set('Cookie', config.refreshToken.name + '=' + refreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
		const login = 'login'
		const password = 'password'
		const email = 'email@email.ru'

		const createdUserRes = await addUserByAdminRequest(app, { login, password, email })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const loginRes = await loginRequest(app, login, password).expect(HTTP_STATUSES.OK_200)
		const refreshTokenStr = loginRes.headers['set-cookie'][0]
		const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

		await request(app)
			.post(RouteNames.authLogout)
			.set('Cookie', config.refreshToken.name + '=' + refreshTokenValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})
})*/

/*describe('Password recovery', () => {
	it.skip('should return 400 if the request body has incorrect data', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		await request(app)
			.post(RouteNames.authPasswordRecovery)
			.send({ email: 'wrong' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 204 if the request body has correct data', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		await request(app)
			.post(RouteNames.authPasswordRecovery)
			.send({ email: userEmail })
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})
})*/

/*describe('New password setting', () => {
	it.skip('should return 400 if the new password is short in request body', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const authPasswordRecoveryRes = await request(app)
			.post(RouteNames.authPasswordRecovery)
			.send({ email: userEmail })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const userId = createdUserRes.body.id
		const getUserRes = await usersRepository.getUserById(userId)

		await request(app)
			.post(RouteNames.authNewPassword)
			.send({ newPassword: 'short', recoveryCode: getUserRes!.account.passwordRecoveryCode })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 400 if the password recovery code is incorrect in request body', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const authPasswordRecoveryRes = await request(app)
			.post(RouteNames.authPasswordRecovery)
			.send({ email: userEmail })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await request(app)
			.post(RouteNames.authNewPassword)
			.send({ newPassword: 'short', recoveryCode: 'wrongRecoveryCode' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 204 if the data is correct in request body', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		await request(app)
			.post(RouteNames.authPasswordRecovery)
			.send({ email: userEmail })
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const userId = createdUserRes.body.id
		const getUserRes = await usersRepository.getUserById(userId)

		const newPasswordRes = await request(app)
			.post(RouteNames.authNewPassword)
			.send({
				newPassword: 'newPassword123',
				recoveryCode: getUserRes!.account.passwordRecoveryCode,
			})
			.expect(HTTP_STATUSES.NO_CONTENT_204)
	})
})*/
