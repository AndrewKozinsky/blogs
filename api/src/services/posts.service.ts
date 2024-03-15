import { Response } from 'express'
import { inject, injectable } from 'inversify'
import { ObjectId } from 'mongodb'
import { ClassNames } from '../composition/classNames'
import { HTTP_STATUSES } from '../config/config'
import { DBTypes } from '../db/dbTypes'
import { ReqWithParamsAndBody } from '../models/common'
import { CommentLikeOperationsDtoModel } from '../models/input/commentLikeOperations.input.model'
import {
	CreatePostCommentDtoModel,
	CreatePostDtoModel,
	UpdatePostDtoModel,
} from '../models/input/posts.input.model'
import { NewestLike, PostOutModel } from '../models/output/posts.output.model'
import { UserServiceModel } from '../models/service/users.service.model'
import { BlogsRepository } from '../repositories/blogs.repository'
import { CommentsRepository } from '../repositories/comments.repository'
import { PostLikesRepository } from '../repositories/postLikes.repository'
import { PostsRepository } from '../repositories/posts.repository'
import { LayerResult, LayerResultCode } from '../types/resultCodes'

@injectable()
export class PostsService {
	@inject(ClassNames.BlogsRepository) private blogsRepository: BlogsRepository
	@inject(ClassNames.CommentsRepository) private commentsRepository: CommentsRepository
	@inject(ClassNames.PostsRepository) private postsRepository: PostsRepository
	@inject(ClassNames.PostLikesRepository) private postLikesRepository: PostLikesRepository

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
			extendedLikesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: DBTypes.LikeStatuses.None,
				newestLikes: [],
			},
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

	async setPostLikeStatus(
		user: UserServiceModel,
		postId: string,
		likeStatus: DBTypes.LikeStatuses,
	): Promise<LayerResult<null>> {
		const post = await this.postsRepository.getPostById(postId)
		if (!post) {
			return {
				code: LayerResultCode.NotFound,
			}
		}

		// Find post like status object if it exists
		const postLike = await this.postLikesRepository.getPostLikeByUser(user.id, postId)

		if (postLike) {
			await this.postLikesRepository.updatePostLike(user.id, postId, likeStatus)
		} else {
			await this.postLikesRepository.createPostLike(user.id, postId, likeStatus)
		}

		return {
			code: LayerResultCode.Success,
		}
	}
}
