import jwt from 'jsonwebtoken'
import { config } from '../config/config'
import { settings } from '../settings'

export const jwtService = {
	createJWT(userId: string) {
		const token = jwt.sign({ userId }, settings.JWT_SECRET, {
			expiresIn: config.accessToken.lifeDurationInMs / 1000 + 's',
		})

		return token
	},

	getUserIdByToken(token: string): null | string {
		try {
			const result: any = jwt.verify(token, settings.JWT_SECRET)
			return result.userId
		} catch (error) {
			return null
		}
	},
}
