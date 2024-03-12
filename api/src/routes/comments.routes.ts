import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { ClassNames } from '../composition/classNames'
import { HTTP_STATUSES } from '../config/config'
import { CommentLikeOperationsDtoModel } from '../models/input/commentLikeOperations.input.model'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentsQueryRepository } from '../repositories/comments.queryRepository'
import { CommentsService } from '../services/comments.service'
import { ReqWithParams, ReqWithParamsAndBody } from '../models/common'
import { LayerResultCode } from '../types/resultCodes'

@injectable()
export class CommentsRouter {
	@inject(ClassNames.CommentsQueryRepository)
	private commentsQueryRepository: CommentsQueryRepository
	@inject(ClassNames.CommentsService) private commentsService: CommentsService

	async getComment(req: ReqWithParams<{ commentId: string }>, res: Response) {
		const { commentId } = req.params
		const { user } = req

		const comment = await this.commentsQueryRepository.getComment(user?.id, commentId)

		if (!comment) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(comment)
	}

	async updateComment(
		req: ReqWithParamsAndBody<{ commentId: string }, UpdateCommentDtoModel>,
		res: Response,
	) {
		const commentId = req.params.commentId

		const updateCommentStatus = await this.commentsService.updateComment(
			req.user!,
			commentId,
			req.body,
		)

		if (updateCommentStatus === 'notOwner') {
			res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
			return
		}

		if (!updateCommentStatus) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async deleteComment(req: ReqWithParams<{ commentId: string }>, res: Response) {
		const commentId = req.params.commentId

		const deleteCommentStatus = await this.commentsService.deleteComment(req.user!, commentId)

		if (deleteCommentStatus === 'notOwner') {
			res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
			return
		}

		if (!deleteCommentStatus) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async setCommentLikeStatus(
		req: ReqWithParamsAndBody<{ commentId: string }, CommentLikeOperationsDtoModel>,
		res: Response,
	) {
		const commentId = req.params.commentId

		const setLikeStatus = await this.commentsService.setCommentLikeStatus(
			req.user!,
			commentId,
			req.body.likeStatus,
		)

		if (setLikeStatus.code === LayerResultCode.NotFound) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}
}
