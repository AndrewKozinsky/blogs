import { query } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const sortByValidation = query('sortBy')
	.optional()
	.isString()
	.withMessage('SortBy must be a string')

export const sortDirectionValidation = query('sortDirection')
	.optional()
	.isIn(['desc', 'asc'])
	.withMessage('SortBy must has desc value or asc')

export const pageNumberValidation = query('pageNumber')
	.optional()
	.isInt()
	.withMessage('PageNumber must be a number')

export const pageSizeValidation = query('pageSize')
	.optional()
	.isInt()
	.withMessage('PageSize must be a number')

export const searchLoginTermValidation = query('searchLoginTerm')
	.optional()
	.isString()
	.withMessage('SearchLoginTerm must be a string')

export const searchEmailTermValidation = query('searchEmailTerm')
	.optional()
	.isString()
	.withMessage('SearchEmailTerm must be a string')

export function getUsersValidation() {
	return [
		sortByValidation,
		sortDirectionValidation,
		pageNumberValidation,
		pageSizeValidation,
		searchLoginTermValidation,
		searchEmailTermValidation,
		inputValidation,
	]
}
