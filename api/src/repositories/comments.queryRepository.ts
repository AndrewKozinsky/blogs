import { ObjectId, WithId } from 'mongodb'
import { CommentModel, PostModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetPostCommentsQueries } from '../models/input/posts.input.model'
import { CommentOutModel, GetCommentOutModel } from '../models/output/comments.output.model'

type GetPostCommentsResult =
	| {
			status: 'postNotValid'
	  }
	| {
			status: 'postNotFound'
	  }
	| {
			status: 'success'
			data: {
				pagesCount: number
				page: number
				pageSize: number
				totalCount: number
				items: CommentOutModel[]
			}
	  }

export const commentsQueryRepository = {
	async getComment(commentId: string): Promise<null | GetCommentOutModel> {
		if (!ObjectId.isValid(commentId)) {
			return null
		}

		const getCommentRes = await CommentModel.findOne({ _id: new ObjectId(commentId) }).lean()

		return getCommentRes ? this.mapDbCommentToOutputComment(getCommentRes) : null
	},
	async getPostComments(
		postId: string,
		queries: GetPostCommentsQueries,
	): Promise<GetPostCommentsResult> {
		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'
		const sort = { [sortBy]: sortDirection }

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		if (!ObjectId.isValid(postId)) {
			return {
				status: 'postNotValid',
			}
		}

		const getPostRes = await PostModel.findOne({ _id: new ObjectId(postId) }).lean()

		if (!getPostRes) {
			return {
				status: 'postNotFound',
			}
		}

		const totalPostCommentsCount = await CommentModel.countDocuments({ postId })
		const pagesCount = Math.ceil(totalPostCommentsCount / pageSize)

		const getPostCommentsRes = await CommentModel.find({ postId })
			.sort(sort)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.lean()

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
