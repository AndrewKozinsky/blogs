import { ItemsOutModel } from './common'

export type PostOutModel = {
	id: string
	title: string
	shortDescription: string
	content: string
	blogId: string
	blogName: string
	createdAt: string
}

export type GetPostsOutModel = ItemsOutModel<PostOutModel>

export type CreatePostOutModel = PostOutModel

export type GetPostOutModel = PostOutModel
