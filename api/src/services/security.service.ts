import { JwtService } from '../application/jwt.service'
import { AuthRepository } from '../repositories/auth.repository'
import { SecurityRepository } from '../repositories/security.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'

export class SecurityService {
	securityRepository: SecurityRepository
	authRepository: AuthRepository
	jwtService: JwtService

	constructor() {
		this.securityRepository = new SecurityRepository()
		this.authRepository = new AuthRepository()
		this.jwtService = new JwtService()
	}

	async terminateAllDeviceRefreshTokensApartThis(refreshTokenStr: string) {
		const refreshToken = this.jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)
		const { deviceId } = refreshToken!

		await this.securityRepository.terminateAllDeviceRefreshTokensApartThis(deviceId)
	}

	async terminateSpecifiedDeviceRefreshToken(
		currentDeviceTokenStr: string,
		deletionDeviceId: string,
	): Promise<LayerResult<null>> {
		// Is device for deletion is not exist give NotFound code
		const deviceRefreshToken =
			await this.authRepository.getDeviceRefreshTokenByDeviceId(deletionDeviceId)

		if (!deviceRefreshToken) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		// Device for deletion exists. Check if current user belongs the device for deletion

		const currentUserDeviceId =
			this.jwtService.getRefreshTokenDataFromTokenStr(currentDeviceTokenStr)?.deviceId

		if (!currentUserDeviceId) {
			return {
				code: LayerResultCode.Unauthorized,
			}
		}

		const userDevices = await this.authRepository.getUserDevicesByDeviceId(currentUserDeviceId)

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
			await this.securityRepository.deleteRefreshTokenByDeviceId(deletionDeviceId)

		return {
			code: isDeviceDeleted ? LayerResultCode.Success : LayerResultCode.Forbidden,
		}
	}
}
