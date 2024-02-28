import { ObjectId, WithId } from 'mongodb'
import { PostModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetPostsQueries } from '../models/input/posts.input.model'
import {
	GetPostOutModel,
	GetPostsOutModel,
	PostOutModel,
} from '../models/output/posts.output.model'

export const postsQueryRepository = {
	async getPosts(queries: GetPostsQueries): Promise<GetPostsOutModel> {
		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'
		const sort = { [sortBy]: sortDirection }

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalPostsCount = await PostModel.countDocuments({})
		const pagesCount = Math.ceil(totalPostsCount / pageSize)

		const getPostsRes = await PostModel.find({})
			.sort(sort)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.lean()

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalPostsCount,
			items: getPostsRes.map(this.mapDbPostToOutputPost),
		}
	},

	async getPost(postId: string): Promise<null | GetPostOutModel> {
		if (!ObjectId.isValid(postId)) {
			return null
		}

		const getPostRes = await PostModel.findOne({ _id: new ObjectId(postId) }).lean()

		return getPostRes ? this.mapDbPostToOutputPost(getPostRes) : null
	},

	mapDbPostToOutputPost(DbPost: WithId<DBTypes.Post>): PostOutModel {
		return {
			id: DbPost._id.toString(),
			title: DbPost.title,
			shortDescription: DbPost.shortDescription,
			content: DbPost.content,
			blogId: DbPost.blogId,
			blogName: DbPost.blogName,
			createdAt: DbPost.createdAt,
		}
	},
}
