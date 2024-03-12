import { app } from '../../../src/app'
import { ClassNames } from '../../../src/composition/classNames'
import { myContainer } from '../../../src/composition/inversify.config'
import { DbService } from '../../../src/db/dbService'

import { clearAllDB } from './db'

const dbService = myContainer.get<DbService>(ClassNames.DbService)

export function resetDbEveryTest() {
	beforeAll(async () => {
		await dbService.runDb()
	})

	beforeEach(async () => {
		await clearAllDB(app)
	})

	afterAll(async function () {
		// await dbService.close()
	})
}
