import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { FilterQuery } from 'mongoose'
import { ClassNames } from '../composition/classNames'
import { BlogModel, PostModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetBlogPostsQueries, GetBlogsQueries } from '../models/input/blogs.input.model'
import {
	BlogOutModel,
	GetBlogOutModel,
	GetBlogPostsOutModel,
	GetBlogsOutModel,
} from '../models/output/blogs.output.model'
import { PostOutModel } from '../models/output/posts.output.model'
import { PostsQueryRepository } from './posts.queryRepository'

@injectable()
export class BlogsQueryRepository {
	@inject(ClassNames.PostsQueryRepository) private postsQueryRepository: PostsQueryRepository

	async getBlogs(query: GetBlogsQueries): Promise<GetBlogsOutModel> {
		const filter: FilterQuery<DBTypes.Blog> = {}

		if (query.searchNameTerm) {
			filter.name = { $regex: new RegExp(query.searchNameTerm, 'i') }
		}

		const sortBy = query.sortBy ?? 'createdAt'
		const sortDirection = query.sortDirection ?? 'desc'
		const sort = { [sortBy]: sortDirection }

		const pageNumber = query.pageNumber ? +query.pageNumber : 1
		const pageSize = query.pageSize ? +query.pageSize : 10

		const totalBlogsCount = await BlogModel.countDocuments(filter)
		const pagesCount = Math.ceil(totalBlogsCount / pageSize)

		const getBlogsRes = await BlogModel.find(filter)
			.sort(sort)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.lean()

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalBlogsCount,
			items: getBlogsRes.map(this.mapDbBlogToOutputBlog),
		}
	}

	async getBlogPosts(
		userId: undefined | string,
		blogId: string,
		queries: GetBlogPostsQueries,
	): Promise<GetBlogPostsOutModel> {
		const filter: FilterQuery<PostOutModel> = {
			blogId,
		}

		// const sortBy = queries.sortBy ?? 'createdAt'
		// const sortDirection = queries.sortDirection ?? 'desc'
		// const sort = { [sortBy]: sortDirection }

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalBlogPostsCount = await PostModel.countDocuments(filter)
		const pagesCount = Math.ceil(totalBlogPostsCount / pageSize)

		const blogPosts = await this.postsQueryRepository.getPosts(userId, queries, blogId)

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalBlogPostsCount,
			items: blogPosts.items,
		}
	}

	async getBlog(blogId: string): Promise<null | GetBlogOutModel> {
		if (!ObjectId.isValid(blogId)) {
			return null
		}

		const getBlogRes = await BlogModel.findOne({ _id: new ObjectId(blogId) }).lean()

		return getBlogRes ? this.mapDbBlogToOutputBlog(getBlogRes) : null
	}

	mapDbBlogToOutputBlog(DbBlog: WithId<DBTypes.Blog>): BlogOutModel {
		return {
			id: DbBlog._id.toString(),
			name: DbBlog.name,
			description: DbBlog.description,
			websiteUrl: DbBlog.websiteUrl,
			createdAt: DbBlog.createdAt,
			isMembership: DbBlog.isMembership,
		}
	}
}
