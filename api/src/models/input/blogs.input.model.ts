export type CreateBlogDtoModel = {
	name: string
	description: string
	websiteUrl: string
}

export type CreateBlogPostDtoModel = {
	title: string
	shortDescription: string
	content: string
}

export type UpdateBlogDtoModel = {
	name: string
	description: string
	websiteUrl: string
}

export type GetBlogsQueries = {
	// Search term for blog Name: Name should contains this term in any position
	searchNameTerm?: string
	// Default value : createdAt
	sortBy?: string
	// Default value: desc. Available values : asc, desc
	sortDirection?: 'desc' | 'asc'
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
}

export type GetBlogPostsQueries = {
	// Default value : createdAt
	sortBy?: string
	// Default value: desc. Available values : asc, desc
	sortDirection?: 'desc' | 'asc'
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
}
