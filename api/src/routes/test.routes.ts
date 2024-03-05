import express, { Request, Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { dbService } from '../db/dbService'
import dotenv from 'dotenv'

dotenv.config()

class TestRouter {
	async deleteAllData(req: Request, res: Response) {
		const isDropped = await dbService.drop()

		if (isDropped) {
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
			return
		}

		res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
	}
}

function getTestRouter() {
	const router = express.Router()
	const testRouter = new TestRouter()

	router.delete('/all-data', testRouter.deleteAllData.bind(testRouter))

	return router
}

export default getTestRouter
