import { addMilliseconds } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { BrowserService } from '../application/browser.service'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { config, HTTP_STATUSES } from '../config/config'
import { RateLimitModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'

const browserService = myContainer.get<BrowserService>(ClassNames.BrowserService)

async function requestsLimiter(req: Request, res: Response, next: NextFunction) {
	const ip = browserService.getClientIP(req)
	const { method, path } = req

	const oldTime = addMilliseconds(new Date(), -config.reqLimit.durationInMs)

	const lastRequests = await RateLimitModel.find({
		ip,
		path,
		method,
		date: { $gte: oldTime },
	}).lean()

	if (lastRequests.length < config.reqLimit.max) {
		const newRequest: DBTypes.RateLimit = {
			method,
			path,
			ip,
			date: new Date(),
		}

		await RateLimitModel.insertMany(newRequest)

		next()
		return
	}

	res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
}

export default requestsLimiter
