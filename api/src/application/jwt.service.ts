import jwt from 'jsonwebtoken'
import { config } from '../config/config'
import { settings } from '../settings'

export const jwtService = {
	createAccessToken(userId: string) {
		const token = jwt.sign({ userId }, settings.JWT_SECRET, {
			expiresIn: config.accessToken.lifeDurationInMs / 1000 + 's',
		})

		return token
	},
	createRefreshToken(userId: string) {
		const token = jwt.sign({ userId }, settings.JWT_SECRET, {
			expiresIn: config.refreshToken.lifeDurationInMs / 1000 + 's',
		})

		return token
	},
	getPayload(token: string) {
		return jwt.decode(token, { complete: true })!.payload
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
