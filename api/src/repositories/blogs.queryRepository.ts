import { Filter, ObjectId, WithId } from 'mongodb'
import DbNames from '../config/dbNames'
import { DBTypes } from '../models/db'
import { GetBlogPostsQueries, GetBlogsQueries } from '../models/input/blogs.input.model'
import {
	BlogOutModel,
	GetBlogOutModel,
	GetBlogPostsOutModel,
	GetBlogsOutModel,
} from '../models/output/blogs.output.model'
import { PostOutModel } from '../models/output/posts.output.model'
import { db, dbService } from '../db/dbService'
import { postsQueryRepository } from './posts.queryRepository'

export const blogsQueryRepository = {
	async getBlogs(query: GetBlogsQueries): Promise<GetBlogsOutModel> {
		const filter: Filter<DBTypes.Blog> = {}

		if (query.searchNameTerm) {
			filter.name = { $regex: query.searchNameTerm, $options: 'i' }
		}

		const sortBy = query.sortBy ?? 'createdAt'
		const sortDirection = query.sortDirection ?? 'desc'

		const pageNumber = query.pageNumber ? +query.pageNumber : 1
		const pageSize = query.pageSize ? +query.pageSize : 10

		const totalBlogsCount = await db.collection(DbNames.blogs).countDocuments(filter)
		const pagesCount = Math.ceil(totalBlogsCount / pageSize)

		const getBlogsRes = await db
			.collection<BlogOutModel>(DbNames.blogs)
			.find(filter)
			.sort(sortBy, sortDirection)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.toArray()

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalBlogsCount,
			items: getBlogsRes.map(this.mapDbBlogToOutputBlog),
		}
	},

	async getBlogPosts(
		blogId: string,
		queries: GetBlogPostsQueries,
	): Promise<GetBlogPostsOutModel> {
		const filter: Filter<PostOutModel> = {
			blogId,
		}

		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalBlogPostsCount = await db.collection(DbNames.posts).countDocuments(filter)
		const pagesCount = Math.ceil(totalBlogPostsCount / pageSize)

		const getBlogPostsRes = await db
			.collection<PostOutModel>(DbNames.posts)
			.find(filter)
			.sort(sortBy, sortDirection)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.toArray()

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalBlogPostsCount,
			items: getBlogPostsRes.map(postsQueryRepository.mapDbPostToOutputPost),
		}
	},

	async getBlog(blogId: string): Promise<null | GetBlogOutModel> {
		if (!ObjectId.isValid(blogId)) {
			return null
		}

		const getBlogRes = await db
			.collection<DBTypes.Blog>(DbNames.blogs)
			.findOne({ _id: new ObjectId(blogId) })

		return getBlogRes ? this.mapDbBlogToOutputBlog(getBlogRes) : null
	},

	mapDbBlogToOutputBlog(DbBlog: WithId<DBTypes.Blog>): BlogOutModel {
		return {
			id: DbBlog._id.toString(),
			name: DbBlog.name,
			description: DbBlog.description,
			websiteUrl: DbBlog.websiteUrl,
			createdAt: DbBlog.createdAt,
			isMembership: DbBlog.isMembership,
		}
	},
}
