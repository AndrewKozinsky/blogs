import express from 'express'
import { commentsRouter } from '../compositionRoot'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'
import { commentLikeOperationsValidation } from '../validators/comments/commentLikeOperationsValidation.validator'
import { updateCommentValidation } from '../validators/comments/updateComment.validator'

function getCommentsRouter() {
	const router = express.Router()

	// Return comment by id
	router.get('/:commentId', setReqUserMiddleware, commentsRouter.getComment.bind(commentsRouter))

	// Update existing comment by id with InputModel
	router.put(
		'/:commentId',
		setReqUserMiddleware,
		checkAccessTokenMiddleware,
		updateCommentValidation(),
		commentsRouter.updateComment.bind(commentsRouter),
	)

	// Delete comment specified by id
	router.delete(
		'/:commentId',
		setReqUserMiddleware,
		checkAccessTokenMiddleware,
		commentsRouter.deleteComment.bind(commentsRouter),
	)

	// Make like/unlike/dislike/undislike operation
	router.put(
		'/:commentId/like-status',
		setReqUserMiddleware,
		checkAccessTokenMiddleware,
		commentLikeOperationsValidation(),
		commentsRouter.setCommentLikeStatus.bind(commentsRouter),
	)

	return router
}

export default getCommentsRouter
