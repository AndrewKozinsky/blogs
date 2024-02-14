import { ObjectId, WithId } from 'mongodb'
import DbNames from '../db/dbNames'
import { DBTypes } from '../db/dbTypes'
import { GetPostsQueries } from '../models/input/posts.input.model'
import {
	GetPostOutModel,
	GetPostsOutModel,
	PostOutModel,
} from '../models/output/posts.output.model'
import { db } from '../db/dbService'

export const postsQueryRepository = {
	async getPosts(queries: GetPostsQueries): Promise<GetPostsOutModel> {
		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalPostsCount = await db.collection(DbNames.posts).countDocuments({})
		const pagesCount = Math.ceil(totalPostsCount / pageSize)

		const getPostsRes = await db
			.collection<DBTypes.Post>(DbNames.posts)
			.find({})
			.sort(sortBy, sortDirection)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.toArray()

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

		const getPostRes = await db
			.collection<DBTypes.Post>(DbNames.posts)
			.findOne({ _id: new ObjectId(postId) })

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
