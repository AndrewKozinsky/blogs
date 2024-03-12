import dotenv from 'dotenv'
import { injectable } from 'inversify'
import * as mongoose from 'mongoose'

dotenv.config()

const mongoURI = process.env.MONGO_URL

@injectable()
export class DbService {
	async runDb() {
		try {
			await mongoose.connect(mongoURI, { dbName: process.env.MONGO_DB_NAME })
			console.log('Connected to DB 🔥')
		} catch {
			await this.close()
			console.log('Cannot connect to DB 🦁')
		}
	}

	async close() {
		await mongoose.disconnect()
	}

	async drop() {
		try {
			const { models } = mongoose

			for (const modelName in models) {
				const model = models[modelName]
				await model.deleteMany()
			}

			return true
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.log(err.message)
			}

			return false
		}
	}
}
