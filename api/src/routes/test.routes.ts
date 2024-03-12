import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ClassNames } from '../composition/classNames'
import { HTTP_STATUSES } from '../config/config'
import dotenv from 'dotenv'
import { DbService } from '../db/dbService'

dotenv.config()

@injectable()
export class TestRouter {
	@inject(ClassNames.DbService) private dbService: DbService

	async deleteAllData(req: Request, res: Response) {
		const isDropped = await this.dbService.drop()

		if (isDropped) {
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
			return
		}

		res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
	}
}
