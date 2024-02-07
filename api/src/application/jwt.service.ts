import { addMilliseconds } from 'date-fns'
import jwt from 'jsonwebtoken'
import { config } from '../config/config'
import { DBTypes } from '../models/db'
import { authRepository } from '../repositories/auth.repository'
import { settings } from '../settings'
import { createUniqString } from '../utils/stringUtils'

export const jwtService = {
	createAccessToken(userId: string) {
		const token = jwt.sign({ userId }, settings.JWT_SECRET, {
			expiresIn: config.accessToken.lifeDurationInMs / 1000 + 's',
		})

		return token
	},

	createRefreshToken(deviceId: string): string {
		const token = jwt.sign({ deviceId }, settings.JWT_SECRET, {
			expiresIn: config.refreshToken.lifeDurationInMs / 1000 + 's',
		})

		return token
	},

	isRefreshTokenInDbValid(refreshTokenInDb: undefined | null | DBTypes.RefreshToken) {
		if (!refreshTokenInDb) {
			return false
		}

		return (
			+addMilliseconds(refreshTokenInDb.issuedAt, config.refreshToken.lifeDurationInMs) >
			+new Date()
		)
	},

	async createRefreshTokenAndSetToDb(userId: string): Promise<string> {
		const deviceId = createUniqString()

		const refreshTokenForDB: DBTypes.RefreshToken = {
			issuedAt: new Date(),
			deviceIP: '',
			deviceId,
			deviceName: '',
			userId,
		}

		await authRepository.setNewRefreshToken(refreshTokenForDB)

		return jwtService.createRefreshToken(deviceId)
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
