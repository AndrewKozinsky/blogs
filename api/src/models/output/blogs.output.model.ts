import { ItemsOutModel } from './common'
import { PostOutModel } from './posts.output.model'

export type BlogOutModel = {
	id: string
	name: string
	description: string
	websiteUrl: string
	createdAt: string
	isMembership: boolean
}

export type GetBlogsOutModel = {
	// Общее количество страниц блогов
	pagesCount: number
	// Номер текущей страницы с выводом блогов
	page: number
	// Сколько блогов на странице с выводом блогов
	pageSize: number
	// Общее количество блогов
	totalCount: number
	// Блоги на указанной странице
	items: BlogOutModel[]
}

export type GetBlogOutModel = BlogOutModel

export type CreateBlogOutModel = BlogOutModel

export type GetBlogPostsOutModel = ItemsOutModel<PostOutModel>
