import express, { Response } from 'express'
import { commentsRouter } from '../compositionRoot'
import { HTTP_STATUSES } from '../config/config'
import { CommentLikeOperationsDtoModel } from '../models/input/commentLikeOperations.input.model'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentsQueryRepository } from '../repositories/comments.queryRepository'
import { CommentsService } from '../services/comments.service'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { ReqWithParams, ReqWithParamsAndBody } from '../models/common'
import { LayerResultCode } from '../types/resultCodes'
import { commentLikeOperationsValidation } from '../validators/comments/commentLikeOperationsValidation.validator'
import { updateCommentValidation } from '../validators/comments/updateComment.validator'

export class CommentsRouter {
	constructor(
		private commentsQueryRepository: CommentsQueryRepository,
		private commentsService: CommentsService,
	) {}

	async getComment(req: ReqWithParams<{ commentId: string }>, res: Response) {
		const { commentId } = req.params
		const { user } = req

		const comment = await this.commentsQueryRepository.getComment(user!.id, commentId)

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
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}
}

function getCommentsRouter() {
	const router = express.Router()

	// Return comment by id
	router.get('/:commentId', commentsRouter.getComment.bind(commentsRouter))

	// Update existing comment by id with InputModel
	router.put(
		'/:commentId',
		checkAccessTokenMiddleware,
		updateCommentValidation(),
		commentsRouter.updateComment.bind(commentsRouter),
	)

	// Delete comment specified by id
	router.delete(
		'/:commentId',
		checkAccessTokenMiddleware,
		commentsRouter.deleteComment.bind(commentsRouter),
	)

	// Make like/unlike/dislike/undislike operation
	router.put(
		'/:commentId/like-status',
		checkAccessTokenMiddleware,
		commentLikeOperationsValidation(),
		commentsRouter.setCommentLikeStatus.bind(commentsRouter),
	)

	return router
}

export default getCommentsRouter
