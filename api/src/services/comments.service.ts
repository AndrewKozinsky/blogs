import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentServiceModel } from '../models/service/comments.service.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { CommentsRepository } from '../repositories/comments.repository'

export class CommentsService {
	commentsRepository: CommentsRepository

	constructor() {
		this.commentsRepository = new CommentsRepository()
	}

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
}
