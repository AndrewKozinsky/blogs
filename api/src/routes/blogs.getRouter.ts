import express from 'express'
import { ClassNames } from '../composition/classNames'
import { myContainer } from '../composition/inversify.config'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import { setReqUserMiddleware } from '../middlewares/setReqUser.middleware'
import { blogValidation } from '../validators/blogs/blog.validator'
import { createBlogPostsValidation } from '../validators/blogs/createBlogPost.validator'
import { getBlogPostsValidation } from '../validators/blogs/getBlogPosts.validator'
import { getBlogsValidation } from '../validators/blogs/getBlogs.validator'
import { BlogsRouter } from './blogs.routes'

function getBlogsRouter() {
	const router = express.Router()
	const blogsRouter = myContainer.get<BlogsRouter>(ClassNames.BlogsRouter)

	// Returns blogs with paging
	router.get(
		'/',
		setReqUserMiddleware,
		getBlogsValidation(),
		blogsRouter.getBlogs.bind(blogsRouter),
	)

	// Create new blog
	router.post(
		'/',
		setReqUserMiddleware,
		adminAuthMiddleware,
		blogValidation(),
		blogsRouter.createNewBlog.bind(blogsRouter),
	)

	// Returns all posts for specified blog
	router.get(
		'/:blogId/posts',
		setReqUserMiddleware,
		getBlogPostsValidation(),
		blogsRouter.getBlogPosts.bind(blogsRouter),
	)

	// Create new post for specific blog
	router.post(
		'/:blogId/posts',
		setReqUserMiddleware,
		adminAuthMiddleware,
		createBlogPostsValidation(),
		blogsRouter.createNewPostForSpecificBlog.bind(blogsRouter),
	)

	// Returns blog by id
	router.get('/:blogId', blogsRouter.getBlog.bind(blogsRouter))

	// Update existing Blog by id with InputModel
	router.put(
		'/:blogId',
		setReqUserMiddleware,
		adminAuthMiddleware,
		blogValidation(),
		blogsRouter.updateBlog.bind(blogsRouter),
	)

	// Delete blog specified by id
	router.delete(
		'/:blogId',
		setReqUserMiddleware,
		adminAuthMiddleware,
		blogsRouter.deleteBlog.bind(blogsRouter),
	)

	return router
}

export default getBlogsRouter
