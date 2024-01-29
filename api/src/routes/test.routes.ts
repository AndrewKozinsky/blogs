import express, { Request, Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { dbService } from '../db/dbService'
import dotenv from 'dotenv'

dotenv.config()

function getTestRouter() {
	const router = express.Router()

	router.delete('/all-data', async (req: Request, res: Response) => {
		const isDropped = await dbService.drop()

		if (isDropped) {
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
			return
		}

		res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
	})

	return router
}

export default getTestRouter
