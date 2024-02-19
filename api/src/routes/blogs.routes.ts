import express, { Response } from 'express'
import { HTTP_STATUSES } from '../config/config'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import requestsLimiter from '../middlewares/requestsLimitter'
import { blogsRepository } from '../repositories/blogs.repository'
import { postsQueryRepository } from '../repositories/posts.queryRepository'
import { blogsService } from '../services/blogs.service'
import {
	ReqWithBody,
	ReqWithParams,
	ReqWithParamsAndBody,
	ReqWithParamsAndQueries,
	ReqWithQuery,
} from '../models/common'
import {
	CreateBlogDtoModel,
	CreateBlogPostDtoModel,
	GetBlogPostsQueries,
	GetBlogsQueries,
	UpdateBlogDtoModel,
} from '../models/input/blogs.input.model'
import { blogsQueryRepository } from '../repositories/blogs.queryRepository'
import { blogValidation } from '../validators/blogs/blog.validator'
import { createBlogPostsValidation } from '../validators/blogs/createBlogPost.validator'
import { getBlogPostsValidation } from '../validators/blogs/getBlogPosts.validator'
import { getBlogsValidation } from '../validators/blogs/getBlogs.validator'

function getBlogsRouter() {
	const router = express.Router()

	// Returns blogs with paging
	router.get(
		'/',
		getBlogsValidation(),
		async function (req: ReqWithQuery<GetBlogsQueries>, res: Response) {
			const blogs = await blogsQueryRepository.getBlogs(req.query)

			res.status(HTTP_STATUSES.OK_200).send(blogs)
		},
	)

	// Create new blog
	router.post(
		'/',
		adminAuthMiddleware,
		blogValidation(),
		async function (req: ReqWithBody<CreateBlogDtoModel>, res: Response) {
			const createdBlogId = await blogsService.createBlog(req.body)
			const createdBlog = await blogsQueryRepository.getBlog(createdBlogId)

			res.status(HTTP_STATUSES.CREATED_201).send(createdBlog)
		},
	)

	// Returns all posts for specified blog
	router.get(
		'/:blogId/posts',
		getBlogPostsValidation(),
		async (
			req: ReqWithParamsAndQueries<{ blogId: string }, GetBlogPostsQueries>,
			res: Response,
		) => {
			const blogId = req.params.blogId

			const blog = await blogsRepository.getBlogById(blogId)
			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			const posts = await blogsQueryRepository.getBlogPosts(blogId, req.query)

			if (!posts) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			res.status(HTTP_STATUSES.OK_200).send(posts)
		},
	)

	// Create new post for specific blog
	router.post(
		'/:blogId/posts',
		adminAuthMiddleware,
		createBlogPostsValidation(),
		async function (
			req: ReqWithParamsAndBody<{ blogId: string }, CreateBlogPostDtoModel>,
			res: Response,
		) {
			const blogId = req.params.blogId

			const blog = await blogsRepository.getBlogById(blogId)

			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			const createPostInsertedId = await blogsService.createBlogPost(blogId, req.body)

			const createdPost = await postsQueryRepository.getPost(createPostInsertedId)

			res.status(HTTP_STATUSES.CREATED_201).send(createdPost)
		},
	)

	// Returns blog by id
	router.get('/:blogId', async (req: ReqWithParams<{ blogId: string }>, res: Response) => {
		const blogId = req.params.blogId

		const blog = await blogsQueryRepository.getBlog(blogId)
		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(blog)
	})

	// Update existing Blog by id with InputModel
	router.put(
		'/:blogId',
		adminAuthMiddleware,
		blogValidation(),
		async (
			req: ReqWithParamsAndBody<{ blogId: string }, UpdateBlogDtoModel>,
			res: Response,
		) => {
			const blogId = req.params.blogId

			const isBlogUpdated = await blogsService.updateBlog(blogId, req.body)

			if (!isBlogUpdated) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	// Delete blog specified by id
	router.delete(
		'/:blogId',
		adminAuthMiddleware,
		async (req: ReqWithParams<{ blogId: string }>, res: Response) => {
			const blogId = req.params.blogId

			const isBlogDeleted = await blogsService.deleteBlog(blogId)

			if (!isBlogDeleted) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
				return
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
		},
	)

	return router
}

export default getBlogsRouter
