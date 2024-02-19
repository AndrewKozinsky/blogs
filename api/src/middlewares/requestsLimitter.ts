import { addMilliseconds } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { browserService } from '../application/browser.service'
import { config, HTTP_STATUSES } from '../config/config'
import DbNames from '../db/dbNames'
import { db } from '../db/dbService'
import { DBTypes } from '../db/dbTypes'

/*const requestsLimiter = rateLimit({
	windowMs: config.reqLimit.durationInMs, // 10 seconds
	limit: config.reqLimit.max, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})*/

async function requestsLimiter(req: Request, res: Response, next: NextFunction) {
	const ip = browserService.getClientIP(req)
	const { method, path } = req

	const oldTime = addMilliseconds(new Date(), -config.reqLimit.durationInMs)

	const lastRequests = await db
		.collection<DBTypes.RateLimit>(DbNames.rateLimit)
		.find({ ip, path, method, date: { $gte: oldTime } })
		.toArray()

	if (lastRequests.length < config.reqLimit.max) {
		const newRequest: DBTypes.RateLimit = {
			method,
			path,
			ip,
			date: new Date(),
		}

		await db.collection<DBTypes.RateLimit>(DbNames.rateLimit).insertOne(newRequest)

		next()
		return
	}

	res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
}

export default requestsLimiter
