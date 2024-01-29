import { app } from './app'
import { config } from './config/config'
import { dbService } from './db/dbService'

async function startApp() {
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
