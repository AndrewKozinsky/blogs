import { UserServiceModel } from '../models/service/users.service.model'

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			AUTH_LOGIN: string
			AUTH_PASSWORD: string
			MONGO_URL: string
			MONGO_DB_NAME: string
			JWT_SECRET: 'dev' | 'test'
		}
	}

	namespace Express {
		export interface Request {
			user: null | UserServiceModel
		}
	}
}
