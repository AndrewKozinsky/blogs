import { query } from 'express-validator'
import { inputValidation } from '../../middlewares/input.validation'

export const searchNameTermValidation = query('searchNameTerm')
	.optional()
	.isString()
	.withMessage('SearchNameTerm must be a string')

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

export function getBlogsValidation() {
	return [
		searchNameTermValidation,
		sortByValidation,
		sortDirectionValidation,
		pageNumberValidation,
		pageSizeValidation,
		inputValidation,
	]
}
