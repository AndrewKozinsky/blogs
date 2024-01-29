import { Express } from 'express'
import request from 'supertest'
import { HTTP_STATUSES } from '../../../src/config/config'
import RouteNames from '../../../src/config/routeNames'

export async function clearAllDB(app: Express) {
	await request(app).delete(RouteNames.testingAllData).expect(HTTP_STATUSES.NO_CONTENT_204)
}
