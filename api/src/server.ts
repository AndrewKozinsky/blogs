import { app } from './app'
import { dbService } from './compositionRoot'
import { config } from './config/config'

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
