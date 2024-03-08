import express from 'express'
import { commentsRouter } from '../compositionRoot'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { commentLikeOperationsValidation } from '../validators/comments/commentLikeOperationsValidation.validator'
import { updateCommentValidation } from '../validators/comments/updateComment.validator'

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
