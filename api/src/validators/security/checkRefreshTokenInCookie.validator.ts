import { cookie } from 'express-validator'
import { jwtService } from '../../application/jwt.service'
import { config } from '../../config/config'
import { inputValidation } from '../../middlewares/input.validation'
import { authRepository } from '../../repositories/auth.repository'

export const codeValidation = cookie(config.refreshToken.name)
	.isString()
	.isLength({ min: 10, max: 100 })
	.withMessage('RefreshToken must be a string')
	.custom(async (value) => {
		const refreshTokenInDb = await authRepository.getRefreshTokenByTokenStr(value)

		if (!jwtService.isRefreshTokenInDbValid(refreshTokenInDb)) {
			throw new Error('RefreshToken is not valid')
		}

		return true
	})

export function checkRefreshTokenInCookieValidation() {
	return [codeValidation, inputValidation]
}
