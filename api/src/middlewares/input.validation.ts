import { Request, Response, NextFunction } from 'express'
import { ValidationError, validationResult } from 'express-validator'
import { HTTP_STATUSES } from '../config/config'
import { ErrorResponse } from '../models/common'

export function inputValidation(req: Request, res: Response, next: NextFunction) {
	const formattedError = validationResult(req).formatWith((error: ValidationError) => {
		return {
			message: error.msg,
			field: error.type === 'field' ? error.path : 'Unknown',
		}
	})

	if (!formattedError.isEmpty()) {
		const errorMessage = formattedError.array({ onlyFirstError: true })

		const errors: ErrorResponse = {
			errorsMessages: errorMessage,
		}

		res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors)
		return
	}

	next()
}
