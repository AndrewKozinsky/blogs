import { inject, injectable } from 'inversify'
import { ObjectId } from 'mongodb'
import { ClassNames } from '../composition/classNames'
import {
	CreatePostCommentDtoModel,
	CreatePostDtoModel,
	UpdatePostDtoModel,
} from '../models/input/posts.input.model'
import { PostOutModel } from '../models/output/posts.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { BlogsRepository } from '../repositories/blogs.repository'
import { CommentsRepository } from '../repositories/comments.repository'
import { PostsRepository } from '../repositories/posts.repository'

@injectable()
export class PostsService {
	@inject(ClassNames.BlogsRepository) private blogsRepository: BlogsRepository
	@inject(ClassNames.CommentsRepository) private commentsRepository: CommentsRepository
	@inject(ClassNames.PostsRepository) private postsRepository: PostsRepository

	async createPost(dto: CreatePostDtoModel): Promise<string> {
		const blog = await this.blogsRepository.getBlogById(dto.blogId)

		const newPostDto: PostOutModel = {
			id: new Date().toISOString(),
			title: dto.title,
			shortDescription: dto.shortDescription,
			content: dto.content,
			blogId: dto.blogId,
			blogName: blog!.name,
			createdAt: new Date().toISOString(),
		}

		return await this.postsRepository.createPost(newPostDto)
	}
	async updatePost(postId: string, updatePostDto: UpdatePostDtoModel) {
		return this.postsRepository.updatePost(postId, updatePostDto)
	}
	async deletePost(postId: string): Promise<boolean> {
		return this.postsRepository.deletePost(postId)
	}
	async createPostComment(
		postId: string,
		commentDto: CreatePostCommentDtoModel,
		user: UserServiceModel,
	): Promise<'postNotExist' | string> {
		if (!ObjectId.isValid(postId)) {
			return 'postNotExist'
		}

		const post = await this.postsRepository.getPostById(postId)
		if (!post) return 'postNotExist'

		return await this.commentsRepository.createPostComment(user, postId, commentDto)
	}
}
