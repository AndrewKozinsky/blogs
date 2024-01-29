import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()

export const client = new MongoClient(process.env.MONGO_URL as string)
export const db = client.db(process.env.MONGO_DB_NAME)

export const dbService = {
	client: new MongoClient(process.env.MONGO_URL as string),

	async runDb() {
		try {
			await this.client.connect()
			// Проверка, что соединение произошло успешно сделав запрос на несуществующую БД products.
			await this.client.db('products').command({ ping: 1 })
			console.log('Connected to DB 🔥')
		} catch {
			await this.close()
			console.log('Cannot connect to DB 🦁')
		}
	},

	async close() {
		await this.client.close()
	},

	async drop() {
		try {
			const collections = await db.listCollections().toArray()

			for (const collection of collections) {
				await db.collection(collection.name).deleteMany({})
			}

			return true
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.log(err.message)
			}

			return false
		} finally {
			await this.client.close()
			// console.log('Connection successful closed')
		}
	},
}
