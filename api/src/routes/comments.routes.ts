import express, { Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { UpdateCommentDtoModel } from '../models/input/comments.input.model'
import { CommentsQueryRepository } from '../repositories/comments.queryRepository'
import { CommentsService } from '../services/comments.service'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { ReqWithParams, ReqWithParamsAndBody } from '../models/common'
import { updateCommentValidation } from '../validators/comments/updateComment.validator'

class CommentsRouter {
	commentsService: CommentsService
	commentsQueryRepository: CommentsQueryRepository

	constructor() {
		this.commentsQueryRepository = new CommentsQueryRepository()
		this.commentsService = new CommentsService()
	}

	async getComment(req: ReqWithParams<{ commentId: string }>, res: Response) {
		const { commentId } = req.params

		const comment = await this.commentsQueryRepository.getComment(commentId)

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
}

function getCommentsRouter() {
	const router = express.Router()
	const commentsRouter = new CommentsRouter()

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

	return router
}

export default getCommentsRouter
