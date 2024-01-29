export type CreateUserDtoModel = {
	login: string
	password: string
	email: string
}

export type GetUsersQueries = {
	// Default value : createdAt
	sortBy?: string
	// Default value: desc. Available values : asc, desc
	sortDirection?: 'desc' | 'asc'
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
	// Search term for user Login: Login should contains this term in any position
	searchLoginTerm?: string
	// Search term for user Email: Email should contains this term in any position
	searchEmailTerm?: string
}
