import { inject, injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { ClassNames } from '../composition/classNames'
import { PostLikeModel, PostLikeSchema, PostModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { GetPostsQueries } from '../models/input/posts.input.model'
import {
	GetPostOutModel,
	GetPostsOutModel,
	NewestLike,
	PostOutModel,
} from '../models/output/posts.output.model'
import { PostLikesRepository } from './postLikes.repository'
import { UsersRepository } from './users.repository'

@injectable()
export class PostsQueryRepository {
	@inject(ClassNames.PostLikesRepository) private postLikesRepository: PostLikesRepository
	@inject(ClassNames.UsersRepository) private usersRepository: UsersRepository

	async getPosts(
		userId: undefined | string,
		queries: GetPostsQueries,
		blogId?: string,
	): Promise<GetPostsOutModel> {
		const sortBy = queries.sortBy ?? 'createdAt'
		const sortDirection = queries.sortDirection ?? 'desc'
		const sort = { [sortBy]: sortDirection }

		const pageNumber = queries.pageNumber ? +queries.pageNumber : 1
		const pageSize = queries.pageSize ? +queries.pageSize : 10

		const totalPostsCount = await PostModel.countDocuments({})
		const pagesCount = Math.ceil(totalPostsCount / pageSize)

		const getPostsRes = await PostModel.find({ blogId })
			.sort(sort)
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize)
			.lean()

		const items = await Promise.all(
			getPostsRes.map(async (post) => {
				const postId = post._id.toString()

				const postLikesStatsRes = await this.postLikesRepository.getPostLikesStats(postId)

				let currentUserCommentLikeStatus = DBTypes.LikeStatuses.None
				if (userId) {
					currentUserCommentLikeStatus =
						await this.postLikesRepository.getUserPostLikeStatus(userId, postId)
				}

				const newestPostLikes = await this.getNewestPostLikes(postId)

				return this.mapDbPostToOutputPost(
					post,
					postLikesStatsRes.likesCount,
					postLikesStatsRes.dislikesCount,
					currentUserCommentLikeStatus,
					newestPostLikes,
				)
			}),
		)

		return {
			pagesCount,
			page: pageNumber,
			pageSize,
			totalCount: totalPostsCount,
			items,
		}
	}

	async getPost(userId: undefined | string, postId: string): Promise<null | GetPostOutModel> {
		if (!ObjectId.isValid(postId)) {
			return null
		}

		const getPostRes = await PostModel.findOne({ _id: new ObjectId(postId) }).lean()

		const postLikesStatsRes = await this.postLikesRepository.getPostLikesStats(postId)

		let currentUserCommentLikeStatus = DBTypes.LikeStatuses.None
		if (userId) {
			currentUserCommentLikeStatus = await this.postLikesRepository.getUserPostLikeStatus(
				userId,
				postId,
			)
		}

		const newestPostLikes = await this.getNewestPostLikes(postId)

		return getPostRes
			? this.mapDbPostToOutputPost(
					getPostRes,
					postLikesStatsRes.likesCount,
					postLikesStatsRes.dislikesCount,
					currentUserCommentLikeStatus,
					newestPostLikes,
				)
			: null
	}

	async getNewestPostLikes(postId: string): Promise<NewestLike[]> {
		const getPostRes = await PostLikeModel.find({ postId, status: DBTypes.LikeStatuses.Like })
			.sort({ addedAt: 'desc' })
			.limit(3)
			.lean()

		return await Promise.all(
			getPostRes.map(async (postLike) => {
				const userRes = await this.usersRepository.getUserById(postLike.userId)

				return {
					addedAt: postLike.addedAt,
					userId: postLike.userId,
					login: userRes!.account.login,
				}
			}),
		)
	}

	mapDbPostToOutputPost(
		DbPost: WithId<DBTypes.Post>,
		likesCount: number,
		dislikesCount: number,
		currentUserCommentLikeStatus: DBTypes.LikeStatuses,
		newestLikes: NewestLike[],
	): PostOutModel {
		return {
			id: DbPost._id.toString(),
			title: DbPost.title,
			shortDescription: DbPost.shortDescription,
			content: DbPost.content,
			blogId: DbPost.blogId,
			blogName: DbPost.blogName,
			createdAt: DbPost.createdAt,
			extendedLikesInfo: {
				likesCount,
				dislikesCount,
				myStatus: currentUserCommentLikeStatus,
				newestLikes,
			},
		}
	}
}
