import { ObjectId } from 'mongodb'
import {
	CreatePostCommentDtoModel,
	CreatePostDtoModel,
	UpdatePostDtoModel,
} from '../models/input/posts.input.model'
import { PostOutModel } from '../models/output/posts.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { blogsRepository } from '../repositories/blogs.repository'
import { commentsRepository } from '../repositories/comments.repository'
import { postsRepository } from '../repositories/posts.repository'

export const postsService = {
	async createPost(dto: CreatePostDtoModel) {
		const blog = await blogsRepository.getBlogById(dto.blogId)

		const newPostDto: PostOutModel = {
			id: new Date().toISOString(),
			title: dto.title,
			shortDescription: dto.shortDescription,
			content: dto.content,
			blogId: dto.blogId,
			blogName: blog!.name,
			createdAt: new Date().toISOString(),
		}

		return await postsRepository.createPost(newPostDto)
	},

	async updatePost(postId: string, updatePostDto: UpdatePostDtoModel) {
		return postsRepository.updatePost(postId, updatePostDto)
	},

	async deletePost(postId: string): Promise<boolean> {
		return postsRepository.deletePost(postId)
	},

	async createPostComment(
		postId: string,
		commentDto: CreatePostCommentDtoModel,
		user: UserServiceModel,
	): Promise<'postNotExist' | string> {
		if (!ObjectId.isValid(postId)) {
			return 'postNotExist'
		}

		const post = await postsRepository.getPostById(postId)
		if (!post) return 'postNotExist'

		return await commentsRepository.createPostComment(user, postId, commentDto)
	},
}
