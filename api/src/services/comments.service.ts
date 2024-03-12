import { inject, injectable } from 'inversify'
import { ClassNames } from '../composition/classNames'
import { DBTypes } from '../db/dbTypes'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentServiceModel } from '../models/service/comments.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { CommentLikesRepository } from '../repositories/commentLikes.repository'
import { CommentsRepository } from '../repositories/comments.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'

@injectable()
export class CommentsService {
	@inject(ClassNames.CommentsRepository) private commentsRepository: CommentsRepository
	@inject(ClassNames.CommentLikesRepository)
	private commentLikesRepository: CommentLikesRepository

	async getComment(commentId: string): Promise<null | CommentServiceModel> {
		return this.commentsRepository.getComment(commentId)
	}

	async updateComment(
		user: UserServiceModel,
		commentId: string,
		updateCommentDto: UpdateCommentDtoModel,
	): Promise<'notOwner' | boolean> {
		const comment = await this.commentsRepository.getComment(commentId)
		if (!comment) return false

		if (comment.commentatorInfo.userId !== user.id) {
			return 'notOwner'
		}

		return this.commentsRepository.updateComment(commentId, updateCommentDto)
	}

	async deleteComment(user: UserServiceModel, commentId: string): Promise<'notOwner' | boolean> {
		const comment = await this.commentsRepository.getComment(commentId)
		if (!comment) return false

		if (comment.commentatorInfo.userId !== user.id) {
			return 'notOwner'
		}

		return this.commentsRepository.deleteComment(commentId)
	}

	async setCommentLikeStatus(
		user: UserServiceModel,
		commentId: string,
		likeStatus: DBTypes.LikeStatuses,
	): Promise<LayerResult<null>> {
		const comment = await this.commentsRepository.getComment(commentId)
		if (!comment) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		// Find comment like status object if it exists
		const commentLike = await this.commentLikesRepository.getCommentLikeByUser(
			user.id,
			commentId,
		)

		if (commentLike) {
			await this.commentLikesRepository.updateCommentLike(user.id, commentId, likeStatus)
		} else {
			await this.commentLikesRepository.createCommentLike(user.id, commentId, likeStatus)
		}

		return {
			code: LayerResultCode.Success,
		}
	}
}
