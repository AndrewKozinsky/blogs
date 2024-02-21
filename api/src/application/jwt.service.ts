import { Request } from 'express'
import { addMilliseconds } from 'date-fns'
import jwt from 'jsonwebtoken'
import { config } from '../config/config'
import { DBTypes } from '../db/dbTypes'
import { authRepository } from '../repositories/auth.repository'
import { settings } from '../settings'
import { createUniqString } from '../utils/stringUtils'

export const jwtService = {
	getDeviceRefreshTokenFromReq(req: Request): string {
		return req.cookies[config.refreshToken.name]
	},

	createAccessTokenStr(userId: string) {
		return jwt.sign({ userId }, settings.JWT_SECRET, {
			expiresIn: config.accessToken.lifeDurationInMs / 1000 + 's',
		})
	},

	createRefreshTokenStr(deviceId: string): string {
		return jwt.sign({ deviceId }, settings.JWT_SECRET, {
			expiresIn: config.refreshToken.lifeDurationInMs / 1000 + 's',
		})
	},

	isDeviceRefreshTokenValid(refreshTokenInDb: undefined | null | DBTypes.DeviceToken) {
		if (!refreshTokenInDb) {
			return false
		}

		return (
			+addMilliseconds(refreshTokenInDb.issuedAt, config.refreshToken.lifeDurationInMs) >
			+new Date()
		)
	},

	createDeviceRefreshToken(
		userId: string,
		deviceIP: string,
		deviceName: string,
	): DBTypes.DeviceToken {
		const deviceId = createUniqString()

		return {
			issuedAt: new Date(),
			expirationDate: addMilliseconds(new Date(), config.refreshToken.lifeDurationInMs),
			deviceIP,
			deviceId,
			deviceName,
			userId,
		}
	},

	getPayload(tokenStr: string) {
		return jwt.decode(tokenStr, { complete: true })!.payload
	},

	getUserIdByAccessTokenStr(accessToken: string): null | string {
		try {
			const result: any = jwt.verify(accessToken, settings.JWT_SECRET)
			return result.userId
		} catch (error) {
			return null
		}
	},

	getRefreshTokenDataFromTokenStr(refreshTokenStr: string) {
		try {
			const payload = jwt.verify(refreshTokenStr, settings.JWT_SECRET)
			return payload as { deviceId: string }
		} catch (error) {
			console.log(error)
			return null
		}
	},
}
