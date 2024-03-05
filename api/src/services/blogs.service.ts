import {
	CreateBlogDtoModel,
	CreateBlogPostDtoModel,
	UpdateBlogDtoModel,
} from '../models/input/blogs.input.model'
import { CreatePostDtoModel } from '../models/input/posts.input.model'
import { CreateBlogOutModel } from '../models/output/blogs.output.model'
import { BlogsRepository } from '../repositories/blogs.repository'
import { PostsService } from './posts.service'

export class BlogsService {
	postsService: PostsService
	blogsRepository: BlogsRepository

	constructor() {
		this.postsService = new PostsService()
		this.blogsRepository = new BlogsRepository()
	}

	async createBlog(dto: CreateBlogDtoModel) {
		const newBlog: CreateBlogOutModel = {
			id: new Date().toISOString(),
			name: dto.name,
			description: dto.description,
			websiteUrl: dto.websiteUrl,
			createdAt: new Date().toISOString(),
			isMembership: false,
		}

		return await this.blogsRepository.createBlog(newBlog)
	}
	async createBlogPost(blogId: string, postDto: CreateBlogPostDtoModel) {
		const newPostDto: CreatePostDtoModel = { blogId, ...postDto }
		return this.postsService.createPost(newPostDto)
	}

	async updateBlog(blogId: string, updateBlogDto: UpdateBlogDtoModel) {
		return this.blogsRepository.updateBlog(blogId, updateBlogDto)
	}

	async deleteBlog(blogId: string): Promise<boolean> {
		return this.blogsRepository.deleteBlog(blogId)
	}
}
