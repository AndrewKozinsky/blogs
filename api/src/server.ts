import { app } from './app'
import { ClassNames } from './composition/classNames'
import { myContainer } from './composition/inversify.config'
import { config } from './config/config'
import { DbService } from './db/dbService'

async function startApp() {
	const dbService = myContainer.get<DbService>(ClassNames.DbService)

	try {
		await dbService.runDb()

		app.listen(config.port, () => {
			console.log(`App started in ${config.port} port 🔥`)
		})
	} catch (err: unknown) {
		console.log('ERROR in startApp()')
	}
}

startApp()
