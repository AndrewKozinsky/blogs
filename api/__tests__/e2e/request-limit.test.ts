// @ts-ignore
import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { GetUsersOutModel } from '../../src/models/output/users.output.model'
import { resetDbEveryTest } from './utils/common'

resetDbEveryTest()

it('123', () => {
	expect(2).toBe(2)
})

describe('Requests limit', () => {
	it('should return 429 if too many requests were made', async () => {
		for (let i = 1; i <= 5; i++) {
			await request(app).get(RouteNames.users).expect(HTTP_STATUSES.UNAUTHORIZED_401)
		}

		await request(app).get(RouteNames.users).expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
	})
})
