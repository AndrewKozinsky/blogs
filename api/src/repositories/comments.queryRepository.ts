import { ObjectId, WithId } from 'mongodb'
import DbNames from '../config/dbNames'
import { DBTypes } from '../models/db'
import { GetPostCommentsQueries } from '../models/input/posts.input.model'
import {
	CommentOutModel,
	GetCommentOutModel,
} from '../models/output/comments.output.model'
import { db } from '../db/dbService'

export const commentsQueryRepository = {
	async getComment(commentId: string): Promise<null | GetCommentOutModel> {
		if (!ObjectId.isValid(commentId)) {
			return null
		}

		const getCommentRes = await db
			.collection<DBTypes.Comment>(DbNames.comments)
			.findOne({ _id: new ObjectId(commentId) })

		return getCommentRes ? this.mapDbCommentToOutputComment(getCommentRes) : null
	},
	async getPostComments(postId: string, queries: GetPostCommentsQueries) {
		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		if (!ObjectId.isValid(postId)) {
			return {
				status: 'postNotValid',
			}
		}

		const getPostRes = await db
			.collection<DBTypes.Post>(DbNames.posts)
			.findOne({ _id: new ObjectId(postId) })

		if (!getPostRes) {
			return {
				status: 'postNotFound',
			}
		}

		const totalPostCommentsCount = await db
			.collection(DbNames.comments)
			.countDocuments({ postId })
		const pagesCount = Math.ceil(totalPostCommentsCount / pageSize)

		const getPostCommentsRes = await db
			.collection<DBTypes.Comment>(DbNames.comments)
			.find({ postId })
			.sort(sortBy, sortDirection)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.toArray()

		return {
			status: 'success',
			data: {
				pagesCount,
				page: pageNumber,
				pageSize,
				totalCount: totalPostCommentsCount,
				items: getPostCommentsRes.map(this.mapDbCommentToOutputComment),
			},
		}
	},

	mapDbCommentToOutputComment(DbComment: WithId<DBTypes.Comment>): CommentOutModel {
		return {
			id: DbComment._id.toString(),
			content: DbComment.content,
			commentatorInfo: {
				userId: DbComment.commentatorInfo.userId,
				userLogin: DbComment.commentatorInfo.userLogin,
			},
			createdAt: DbComment.createdAt,
		}
	},
}
