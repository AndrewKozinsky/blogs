import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { ClassNames } from '../composition/classNames'
import { CommentModel, PostModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetPostCommentsQueries } from '../models/input/posts.input.model'
import { CommentOutModel, GetCommentOutModel } from '../models/output/comments.output.model'
import { CommentLikesRepository } from './commentLikes.repository'

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

@injectable()
export class CommentsQueryRepository {
	@inject(ClassNames.CommentLikesRepository)
	private commentLikesRepository: CommentLikesRepository

	async getComment(
		userId: undefined | string,
		commentId: string,
	): Promise<null | GetCommentOutModel> {
		if (!ObjectId.isValid(commentId)) {
			return null
		}

		const getCommentRes = await CommentModel.findOne({ _id: new ObjectId(commentId) }).lean()

		const commentLikesStatsRes =
			await this.commentLikesRepository.getCommentLikesStats(commentId)

		let currentUserCommentLikeStatus = DBTypes.LikeStatuses.None
		if (userId) {
			currentUserCommentLikeStatus =
				await this.commentLikesRepository.getUserCommentLikeStatus(userId, commentId)
		}

		return getCommentRes
			? this.mapDbCommentToOutputComment(
					getCommentRes,
					commentLikesStatsRes.likesCount,
					commentLikesStatsRes.dislikesCount,
					currentUserCommentLikeStatus,
				)
			: null
	}
	async getPostComments(
		userId: undefined | string,
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

		const items = await Promise.all(
			getPostCommentsRes.map(async (comment) => {
				const commentLikesStatsRes = await this.commentLikesRepository.getCommentLikesStats(
					comment._id.toString(),
				)

				let currentUserCommentLikeStatus = DBTypes.LikeStatuses.None
				if (userId) {
					currentUserCommentLikeStatus =
						await this.commentLikesRepository.getUserCommentLikeStatus(
							userId,
							comment._id.toString(),
						)
				}

				return this.mapDbCommentToOutputComment(
					comment,
					commentLikesStatsRes.likesCount,
					commentLikesStatsRes.dislikesCount,
					currentUserCommentLikeStatus,
				)
			}),
		)

		return {
			status: 'success',
			data: {
				pagesCount,
				page: pageNumber,
				pageSize,
				totalCount: totalPostCommentsCount,
				items,
			},
		}
	}

	mapDbCommentToOutputComment(
		DbComment: WithId<DBTypes.Comment>,
		likesCount: number,
		dislikesCount: number,
		currentUserCommentLikeStatus: DBTypes.LikeStatuses,
	): CommentOutModel {
		return {
			id: DbComment._id.toString(),
			content: DbComment.content,
			commentatorInfo: {
				userId: DbComment.commentatorInfo.userId,
				userLogin: DbComment.commentatorInfo.userLogin,
			},
			createdAt: DbComment.createdAt,
			likesInfo: {
				likesCount,
				dislikesCount,
				myStatus: currentUserCommentLikeStatus,
			},
		}
	}
}
