export type CreatePostDtoModel = {
	title: string
	shortDescription: string
	content: string
	blogId: string
}

export type UpdatePostDtoModel = {
	title: string
	shortDescription: string
	content: string
	blogId: string
}

export type GetPostsQueries = {
	// Default value : createdAt
	sortBy?: string
	// Default value: desc. Available values : asc, desc
	sortDirection?: 'desc' | 'asc'
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
}

export type GetPostCommentsQueries = {
	// Default value : createdAt
	sortBy?: string
	// Default value: desc. Available values : asc, desc
	sortDirection?: 'desc' | 'asc'
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
}

export type CreatePostCommentDtoModel = {
	content: string
}
