import express from 'express'
import { testRouter } from '../compositionRoot'
import dotenv from 'dotenv'

dotenv.config()

function getTestRouter() {
	const router = express.Router()

	router.delete('/all-data', testRouter.deleteAllData.bind(testRouter))

	return router
}

export default getTestRouter
