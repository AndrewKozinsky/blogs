import { injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { CommentModel, CommentLikeModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CreatePostCommentDtoModel } from '../models/input/posts.input.model'
import { CommentLikeServiceModel } from '../models/service/commentLikes.service.model'
import { CommentServiceModel } from '../models/service/comments.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { LayerResult } from '../types/resultCodes'
import { createUniqString } from '../utils/stringUtils'

@injectable()
export class CommentLikesRepository {
	async getCommentLikeByUser(userId: string, commentId: string) {
		if (!ObjectId.isValid(userId) || !ObjectId.isValid(commentId)) {
			return null
		}

		const getCommentLikeRes = await CommentLikeModel.findOne({ userId, commentId }).lean()

		return getCommentLikeRes
			? this.mapDbCommentLikeToClientCommentLike(getCommentLikeRes)
			: null
	}

	async createCommentLike(userId: string, commentId: string, likeStatus: DBTypes.LikeStatuses) {
		const newCommentLike: DBTypes.CommentLike = {
			userId,
			commentId,
			status: likeStatus,
		}

		await CommentLikeModel.create(newCommentLike)
	}

	async updateCommentLike(
		userId: string,
		commentId: string,
		likeStatus: DBTypes.LikeStatuses,
	): Promise<boolean> {
		if (!ObjectId.isValid(userId) || !ObjectId.isValid(commentId)) {
			return false
		}

		const updateCommentRes = await CommentLikeModel.updateOne(
			{ userId, commentId },
			{ $set: { status: likeStatus } },
		)

		return updateCommentRes.modifiedCount === 1
	}

	async getCommentLikesStats(
		commentId: string,
	): Promise<{ likesCount: number; dislikesCount: number }> {
		if (!ObjectId.isValid(commentId)) {
			return { likesCount: 0, dislikesCount: 0 }
		}

		const getCommentLikesRes = await CommentLikeModel.find({ commentId }).lean()

		let likesCount = 0
		let dislikesCount = 0

		getCommentLikesRes.forEach((likeObj) => {
			if (likeObj.status === DBTypes.LikeStatuses.Like) {
				likesCount++
			} else if (likeObj.status === DBTypes.LikeStatuses.Dislike) {
				dislikesCount++
			}
		})

		return { likesCount, dislikesCount }
	}

	async getUserCommentLikeStatus(
		userId: string,
		commentId: string,
	): Promise<DBTypes.LikeStatuses> {
		const commentLikeRes = await this.getCommentLikeByUser(userId, commentId)
		if (!commentLikeRes) {
			return DBTypes.LikeStatuses.None
		}

		return commentLikeRes.status
	}

	mapDbCommentLikeToClientCommentLike(
		DbCommentLike: WithId<DBTypes.CommentLike>,
	): CommentLikeServiceModel {
		return {
			commentId: DbCommentLike.commentId,
			userId: DbCommentLike.userId,
			status: DbCommentLike.status,
		}
	}
}
