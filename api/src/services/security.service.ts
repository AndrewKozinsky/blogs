import { jwtService } from '../application/jwt.service'
import { securityRepository } from '../repositories/security.repository'

export const securityService = {
	async terminateAllDeviceRefreshTokensApartThis(refreshTokenStr: string) {
		const { deviceId } = jwtService.getPayload(refreshTokenStr) as { deviceId: string }

		await securityRepository.terminateAllDeviceRefreshTokensApartThis(deviceId)
	},
}
