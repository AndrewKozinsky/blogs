import express, { Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import requestsLimiter from '../middlewares/requestsLimitter'
import { commentsQueryRepository } from '../repositories/comments.queryRepository'
import { postsService } from '../services/posts.service'
import { checkAccessTokenMiddleware } from '../middlewares/checkAccessTokenMiddleware'
import {
	ReqWithBody,
	ReqWithParams,
	ReqWithParamsAndBody,
	ReqWithParamsAndQueries,
	ReqWithQuery,
} from '../models/common'
import {
	CreatePostCommentDtoModel,
	CreatePostDtoModel,
	GetPostCommentsQueries,
	GetPostsQueries,
	UpdatePostDtoModel,
} from '../models/input/posts.input.model'
import { postsQueryRepository } from '../repositories/posts.queryRepository'
import { createPostCommentValidation } from '../validators/posts/createPostComment.validator'
import { getPostCommentsValidation } from '../validators/posts/getPostComments.validator'
import { getPostsValidation } from '../validators/posts/getPosts.validator'
import { postValidation } from '../validators/posts/post.validator'

class PostsRouter {
	// Returns all posts
	async getPosts(req: ReqWithQuery<GetPostsQueries>, res: Response) {
		const posts = await postsQueryRepository.getPosts(req.query)

		res.status(HTTP_STATUSES.OK_200).send(posts)
	}

	async createNewPost(req: ReqWithBody<CreatePostDtoModel>, res: Response) {
		const createPostId = await postsService.createPost(req.body)

		const getPostRes = await postsQueryRepository.getPost(createPostId)

		res.status(HTTP_STATUSES.CREATED_201).send(getPostRes)
	}

	// Return post by id
	async getPost(req: ReqWithParams<{ postId: string }>, res: Response) {
		const postId = req.params.postId

		const post = await postsQueryRepository.getPost(postId)

		if (!post) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(post)
	}

	// Update existing post by id with InputModel
	async updatePost(
		req: ReqWithParamsAndBody<{ postId: string }, UpdatePostDtoModel>,
		res: Response,
	) {
		const postId = req.params.postId

		const isPostUpdated = await postsService.updatePost(postId, req.body)

		if (!isPostUpdated) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	// Delete post specified by id
	async deletePost(req: ReqWithParams<{ postId: string }>, res: Response) {
		const postId = req.params.postId

		const isPostDeleted = await postsService.deletePost(postId)

		if (!isPostDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	// Returns comments for specified post
	async getPostComments(
		req: ReqWithParamsAndQueries<{ postId: string }, GetPostCommentsQueries>,
		res: Response,
	) {
		const postId = req.params.postId
		const postComments = await commentsQueryRepository.getPostComments(postId, req.query)

		if (postComments.status === 'postNotValid' || postComments.status === 'postNotFound') {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(postComments.data)
	}

	// Create new comment
	async createComment(
		req: ReqWithParamsAndBody<{ postId: string }, CreatePostCommentDtoModel>,
		res: Response,
	) {
		const postId = req.params.postId

		const createdCommentId = await postsService.createPostComment(postId, req.body, req.user!)

		if (createdCommentId === 'postNotExist') {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		const getCommentRes = await commentsQueryRepository.getComment(createdCommentId)

		res.status(HTTP_STATUSES.CREATED_201).send(getCommentRes)
	}
}

function getPostsRouter() {
	const router = express.Router()
	const postsRouter = new PostsRouter()

	// Returns all posts
	router.get('/', getPostsValidation(), postsRouter.getPosts)

	// Create new post
	router.post('/', adminAuthMiddleware, postValidation(), postsRouter.createNewPost)

	// Return post by id
	router.get('/:postId', postsRouter.getPost)

	// Update existing post by id with InputModel
	router.put('/:postId', adminAuthMiddleware, postValidation(), postsRouter.updatePost)

	// Delete post specified by id
	router.delete('/:postId', adminAuthMiddleware, postsRouter.deletePost)

	// Returns comments for specified post
	router.get('/:postId/comments', getPostCommentsValidation(), postsRouter.getPostComments)

	// Create new comment
	router.post(
		'/:postId/comments',
		checkAccessTokenMiddleware,
		createPostCommentValidation(),
		postsRouter.createComment,
	)

	return router
}

export default getPostsRouter
