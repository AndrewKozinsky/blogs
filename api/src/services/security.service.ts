import { jwtService } from '../application/jwt.service'
import { authRepository } from '../repositories/auth.repository'
import { securityRepository } from '../repositories/security.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'

class SecurityService {
	async terminateAllDeviceRefreshTokensApartThis(refreshTokenStr: string) {
		const refreshToken = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)
		const { deviceId } = refreshToken!

		await securityRepository.terminateAllDeviceRefreshTokensApartThis(deviceId)
	}

	async terminateSpecifiedDeviceRefreshToken(
		currentDeviceTokenStr: string,
		deletionDeviceId: string,
	): Promise<LayerResult<null>> {
		// Is device for deletion is not exist give NotFound code
		const deviceRefreshToken =
			await authRepository.getDeviceRefreshTokenByDeviceId(deletionDeviceId)

		if (!deviceRefreshToken) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		// Device for deletion exists. Check if current user belongs the device for deletion

		const currentUserDeviceId =
			jwtService.getRefreshTokenDataFromTokenStr(currentDeviceTokenStr)?.deviceId

		if (!currentUserDeviceId) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		const userDevices = await authRepository.getUserDevicesByDeviceId(currentUserDeviceId)

		if (userDevices.code !== LayerResultCode.Success || !userDevices.data) {
			return {
				code: LayerResultCode.Forbidden,
			}
		}

		const deletionDeviceInUserDevices = userDevices.data.find((userDevice) => {
			return userDevice.deviceId === deletionDeviceId
		})

		if (!deletionDeviceInUserDevices) {
			return {
				code: LayerResultCode.Forbidden,
			}
		}

		const isDeviceDeleted =
			await securityRepository.deleteRefreshTokenByDeviceId(deletionDeviceId)

		return {
			code: isDeviceDeleted ? LayerResultCode.Success : LayerResultCode.Forbidden,
		}
	}
}

export const securityService = new SecurityService()
