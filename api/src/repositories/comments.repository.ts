import { injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { CommentModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CreatePostCommentDtoModel } from '../models/input/posts.input.model'
import { CommentServiceModel } from '../models/service/comments.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { createUniqString } from '../utils/stringUtils'

@injectable()
export class CommentsRepository {
	async getComment(commentId: string) {
		if (!ObjectId.isValid(commentId)) {
			return null
		}

		const getCommentRes = await CommentModel.findOne({ _id: new ObjectId(commentId) }).lean()

		return getCommentRes ? this.mapDbCommentToClientComment(getCommentRes) : null
	}

	async createPostComment(
		user: UserServiceModel,
		postId: string,
		commentDto: CreatePostCommentDtoModel,
	) {
		const newPostComment = {
			postId,
			content: commentDto.content,
			commentatorInfo: {
				userId: user.id,
				userLogin: user.account.login,
			},
			createdAt: new Date().toISOString(),
		}

		const createdPostCommentRes = await CommentModel.create(newPostComment)
		const postClientComment = this.mapDbCommentToClientComment(createdPostCommentRes)
		return postClientComment.id
	}

	async updateComment(
		commentId: string,
		updateCommentDto: UpdateCommentDtoModel,
	): Promise<boolean> {
		if (!ObjectId.isValid(commentId)) {
			return false
		}

		const updateCommentRes = await CommentModel.updateOne(
			{ _id: new ObjectId(commentId) },
			{ $set: updateCommentDto },
		)

		return updateCommentRes.modifiedCount === 1
	}

	async deleteComment(commentId: string): Promise<boolean> {
		if (!ObjectId.isValid(commentId)) {
			return false
		}

		const result = await CommentModel.deleteOne({ _id: new ObjectId(commentId) })

		return result.deletedCount === 1
	}

	mapDbCommentToClientComment(DbComment: WithId<DBTypes.Comment>): CommentServiceModel {
		return {
			id: DbComment._id.toString(),
			content: DbComment.content,
			commentatorInfo: {
				userId: DbComment.commentatorInfo.userId,
				userLogin: DbComment.commentatorInfo.userLogin,
			},
			createdAt: DbComment.createdAt,
		}
	}
}
