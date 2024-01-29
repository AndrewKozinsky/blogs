import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentServiceModel } from '../models/service/comments.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { commentsRepository } from '../repositories/comments.repository'

export const commentsService = {
	async getComment(commentId: string): Promise<null | CommentServiceModel> {
		return commentsRepository.getComment(commentId)
	},

	async updateComment(
		user: UserServiceModel,
		commentId: string,
		updateCommentDto: UpdateCommentDtoModel,
	): Promise<'notOwner' | boolean> {
		const comment = await commentsRepository.getComment(commentId)
		if (!comment) return false

		if (comment.commentatorInfo.userId !== user.id) {
			return 'notOwner'
		}

		return commentsRepository.updateComment(commentId, updateCommentDto)
	},

	async deleteComment(user: UserServiceModel, commentId: string): Promise<'notOwner' | boolean> {
		const comment = await commentsRepository.getComment(commentId)
		if (!comment) return false

		if (comment.commentatorInfo.userId !== user.id) {
			return 'notOwner'
		}

		return commentsRepository.deleteComment(commentId)
	},
}
