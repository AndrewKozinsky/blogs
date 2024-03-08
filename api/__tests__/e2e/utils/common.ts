import { app } from '../../../src/app'
import { dbService } from '../../../src/compositionRoot'

import { clearAllDB } from './db'

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
