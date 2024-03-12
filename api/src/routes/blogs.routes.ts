import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { ClassNames } from '../composition/classNames'
import { HTTP_STATUSES } from '../config/config'
import { BlogsRepository } from '../repositories/blogs.repository'
import { PostsQueryRepository } from '../repositories/posts.queryRepository'
import { BlogsService } from '../services/blogs.service'
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
import { BlogsQueryRepository } from '../repositories/blogs.queryRepository'

@injectable()
export class BlogsRouter {
	@inject(ClassNames.BlogsService) private blogsService: BlogsService
	@inject(ClassNames.BlogsRepository) private blogsRepository: BlogsRepository
	@inject(ClassNames.BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository
	@inject(ClassNames.PostsQueryRepository) private postsQueryRepository: PostsQueryRepository

	async getBlogs(req: ReqWithQuery<GetBlogsQueries>, res: Response) {
		const blogs = await this.blogsQueryRepository.getBlogs(req.query)

		res.status(HTTP_STATUSES.OK_200).send(blogs)
	}

	async createNewBlog(req: ReqWithBody<CreateBlogDtoModel>, res: Response) {
		const createdBlogId = await this.blogsService.createBlog(req.body)
		const createdBlog = await this.blogsQueryRepository.getBlog(createdBlogId)

		res.status(HTTP_STATUSES.CREATED_201).send(createdBlog)
	}

	async getBlogPosts(
		req: ReqWithParamsAndQueries<{ blogId: string }, GetBlogPostsQueries>,
		res: Response,
	) {
		const blogId = req.params.blogId

		const blog = await this.blogsRepository.getBlogById(blogId)
		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		const posts = await this.blogsQueryRepository.getBlogPosts(blogId, req.query)

		if (!posts) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(posts)
	}

	async createNewPostForSpecificBlog(
		req: ReqWithParamsAndBody<{ blogId: string }, CreateBlogPostDtoModel>,
		res: Response,
	) {
		const blogId = req.params.blogId

		const blog = await this.blogsRepository.getBlogById(blogId)

		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		const createPostInsertedId = await this.blogsService.createBlogPost(blogId, req.body)

		const createdPost = await this.postsQueryRepository.getPost(createPostInsertedId)

		res.status(HTTP_STATUSES.CREATED_201).send(createdPost)
	}

	async getBlog(req: ReqWithParams<{ blogId: string }>, res: Response) {
		const blogId = req.params.blogId

		const blog = await this.blogsQueryRepository.getBlog(blogId)
		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.status(HTTP_STATUSES.OK_200).send(blog)
	}

	async updateBlog(
		req: ReqWithParamsAndBody<{ blogId: string }, UpdateBlogDtoModel>,
		res: Response,
	) {
		const blogId = req.params.blogId

		const isBlogUpdated = await this.blogsService.updateBlog(blogId, req.body)

		if (!isBlogUpdated) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}

	async deleteBlog(req: ReqWithParams<{ blogId: string }>, res: Response) {
		const blogId = req.params.blogId

		const isBlogDeleted = await this.blogsService.deleteBlog(blogId)

		if (!isBlogDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
			return
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
	}
}
