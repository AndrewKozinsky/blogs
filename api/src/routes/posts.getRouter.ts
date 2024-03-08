import express from 'express'
import { postsRouter } from '../compositionRoot'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import { createPostCommentValidation } from '../validators/posts/createPostComment.validator'
import { getPostCommentsValidation } from '../validators/posts/getPostComments.validator'
import { getPostsValidation } from '../validators/posts/getPosts.validator'
import { postValidation } from '../validators/posts/post.validator'

function getPostsRouter() {
	const router = express.Router()

	// Returns all posts
	router.get('/', getPostsValidation(), postsRouter.getPosts.bind(postsRouter))

	// Create new post
	router.post(
		'/',
		adminAuthMiddleware,
		postValidation(),
		postsRouter.createNewPost.bind(postsRouter),
	)

	// Return post by id
	router.get('/:postId', postsRouter.getPost.bind(postsRouter))

	// Update existing post by id with InputModel
	router.put(
		'/:postId',
		adminAuthMiddleware,
		postValidation(),
		postsRouter.updatePost.bind(postsRouter),
	)

	// Delete post specified by id
	router.delete('/:postId', adminAuthMiddleware, postsRouter.deletePost.bind(postsRouter))

	// Returns comments for specified post
	router.get(
		'/:postId/comments',
		getPostCommentsValidation(),
		postsRouter.getPostComments.bind(postsRouter),
	)

	// Create new comment
	router.post(
		'/:postId/comments',
		checkAccessTokenMiddleware,
		createPostCommentValidation(),
		postsRouter.createComment.bind(postsRouter),
	)

	return router
}

export default getPostsRouter
