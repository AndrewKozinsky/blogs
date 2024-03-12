import express from 'express'
import { ClassNames } from '../composition/classNames'
import dotenv from 'dotenv'
import { myContainer } from '../composition/inversify.config'
import { TestRouter } from './test.routes'

dotenv.config()

function getTestRouter() {
	const router = express.Router()
	const testRouter = myContainer.get<TestRouter>(ClassNames.TestRouter)

	router.delete('/all-data', testRouter.deleteAllData.bind(testRouter))

	return router
}

export default getTestRouter
