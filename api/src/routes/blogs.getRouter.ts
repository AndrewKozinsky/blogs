import express from 'express'
import { blogsRouter } from '../compositionRoot'
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'
import { blogValidation } from '../validators/blogs/blog.validator'
import { createBlogPostsValidation } from '../validators/blogs/createBlogPost.validator'
import { getBlogPostsValidation } from '../validators/blogs/getBlogPosts.validator'
import { getBlogsValidation } from '../validators/blogs/getBlogs.validator'

function getBlogsRouter() {
	const router = express.Router()

	// Returns blogs with paging
	router.get('/', getBlogsValidation(), blogsRouter.getBlogs.bind(blogsRouter))

	// Create new blog
	router.post(
		'/',
		adminAuthMiddleware,
		blogValidation(),
		blogsRouter.createNewBlog.bind(blogsRouter),
	)

	// Returns all posts for specified blog
	router.get(
		'/:blogId/posts',
		getBlogPostsValidation(),
		blogsRouter.getBlogPosts.bind(blogsRouter),
	)

	// Create new post for specific blog
	router.post(
		'/:blogId/posts',
		adminAuthMiddleware,
		createBlogPostsValidation(),
		blogsRouter.createNewPostForSpecificBlog.bind(blogsRouter),
	)

	// Returns blog by id
	router.get('/:blogId', blogsRouter.getBlog.bind(blogsRouter))

	// Update existing Blog by id with InputModel
	router.put(
		'/:blogId',
		adminAuthMiddleware,
		blogValidation(),
		blogsRouter.updateBlog.bind(blogsRouter),
	)

	// Delete blog specified by id
	router.delete('/:blogId', adminAuthMiddleware, blogsRouter.deleteBlog.bind(blogsRouter))

	return router
}

export default getBlogsRouter
