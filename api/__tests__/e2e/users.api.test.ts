import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { GetUsersOutModel } from '../../src/models/output/users.output.model'
import { resetDbEveryTest } from './utils/common'
import { addUserByAdminRequest, adminAuthorizationValue, checkUserObj } from './utils/utils'

resetDbEveryTest()

it.skip('123', () => {
	expect(2).toBe(2)
})

describe('Getting all users', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).get(RouteNames.users).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return an object with property items contains an empty array', async () => {
		const successAnswer: GetUsersOutModel = {
			pagesCount: 0,
			page: 1,
			pageSize: 10,
			totalCount: 0,
			items: [],
		}

		await request(app)
			.get(RouteNames.users)
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.OK_200, successAnswer)
	})

	it.skip('should return an object with property items contains array with 2 items after creating 2 users', async () => {
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)

		const getUsersRes = await request(app)
			.get(RouteNames.users)
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.OK_200)

		expect(getUsersRes.body.pagesCount).toBe(1)
		expect(getUsersRes.body.page).toBe(1)
		expect(getUsersRes.body.pageSize).toBe(10)
		expect(getUsersRes.body.totalCount).toBe(2)
		expect(getUsersRes.body.items.length).toBe(2)

		checkUserObj(getUsersRes.body.items[0])
		checkUserObj(getUsersRes.body.items[1])
	})

	it.skip('should return an array of objects matching the queries scheme', async () => {
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)
		await addUserByAdminRequest(app)

		const getUsersRes = await request(app)
			.get(RouteNames.users + '?pageNumber=2&pageSize=2')
			.set('authorization', adminAuthorizationValue)

		expect(getUsersRes.body.page).toBe(2)
		expect(getUsersRes.body.pagesCount).toBe(4)
		expect(getUsersRes.body.totalCount).toBe(7)
		expect(getUsersRes.body.items.length).toBe(2)
	})

	it.skip('should return filtered an array of objects', async () => {
		await addUserByAdminRequest(app, { login: 'in-one-1', email: 'email-1@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-two-1', email: 'email-1@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-one-1', email: 'email-1@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-two-1', email: 'email-1@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-one-1', email: 'email-1@email.jp' }) //
		await addUserByAdminRequest(app, { login: 'in-three-1', email: 'email-1@email.us' })
		await addUserByAdminRequest(app, { login: 'in-one-1', email: 'email-1@email.ru' }) //
		await addUserByAdminRequest(app, { login: 'in-one-2', email: 'email-3@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-one-3', email: 'email-4@email.com' }) //
		await addUserByAdminRequest(app, { login: 'in-one-4', email: 'email-5@email.com' }) //

		const getUsersRes = await request(app)
			.get(
				RouteNames.users +
					'?pageNumber=2&pageSize=2&searchLoginTerm=one&searchEmailTerm=.com',
			)
			.set('authorization', adminAuthorizationValue)

		expect(getUsersRes.body.page).toBe(2)
		expect(getUsersRes.body.pagesCount).toBe(5)
		expect(getUsersRes.body.totalCount).toBe(9)
		expect(getUsersRes.body.items.length).toBe(2)
	})
})

describe('Creating an user', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).post(RouteNames.users).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not create an user by wrong dto', async () => {
		const createdUserRes = await addUserByAdminRequest(app, { login: 'lo' })
		expect(createdUserRes.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(createdUserRes.body.errorsMessages)).toBe('[object Array]')
		expect(createdUserRes.body.errorsMessages.length).toBe(1)
		expect(createdUserRes.body.errorsMessages[0].field).toBe('login')
	})

	it.skip('should create an user by correct dto', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)

		checkUserObj(createdUserRes.body)

		// Check if there are 2 users after adding another one
		const createdUser2Res = await addUserByAdminRequest(app)
		expect(createdUser2Res.status).toBe(HTTP_STATUSES.CREATED_201)

		const allUsersRes = await request(app)
			.get(RouteNames.users)
			.set('authorization', adminAuthorizationValue)
		expect(allUsersRes.body.items.length).toBe(2)
	})
})

describe('Deleting an user', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		return request(app).put(RouteNames.users)
	})

	it.skip('should not delete a non existing user', async () => {
		await request(app)
			.delete(RouteNames.user('999'))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should delete an user', async () => {
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdUserId = createdUserRes.body.id

		await request(app)
			.delete(RouteNames.user(createdUserId))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await request(app)
			.get(RouteNames.user(createdUserId))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})
})
