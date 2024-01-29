import { ObjectId, WithId } from 'mongodb'
import DbNames from '../config/dbNames'
import { DBTypes } from '../models/db'
import { UpdatePostDtoModel } from '../models/input/posts.input.model'
import { CreatePostOutModel } from '../models/output/posts.output.model'
import { PostServiceModel } from '../models/service/posts.service.model'
import { db } from '../db/dbService'

export const postsRepository = {
	async getPosts() {
		const getPostsRes = await db.collection<DBTypes.Post>(DbNames.posts).find({}).toArray()
		return getPostsRes.map(this.mapDbPostToClientPost)
	},

	async getPostById(postId: string) {
		if (!ObjectId.isValid(postId)) {
			return null
		}

		const getPostRes = await db
			.collection<DBTypes.Post>(DbNames.posts)
			.findOne({ _id: new ObjectId(postId) })

		return getPostRes ? this.mapDbPostToClientPost(getPostRes) : null
	},

	async createPost(dto: CreatePostOutModel) {
		const createdPostRes = await db.collection(DbNames.posts).insertOne(dto)
		return createdPostRes.insertedId.toString()
	},

	async updatePost(postId: string, updatePostDto: UpdatePostDtoModel): Promise<boolean> {
		if (!ObjectId.isValid(postId)) {
			return false
		}

		const updatePostRes = await db
			.collection<DBTypes.Post>(DbNames.posts)
			.updateOne({ _id: new ObjectId(postId) }, { $set: updatePostDto })

		return updatePostRes.modifiedCount === 1
	},

	async deletePost(postId: string): Promise<boolean> {
		if (!ObjectId.isValid(postId)) {
			return false
		}

		const result = await db.collection(DbNames.posts).deleteOne({ _id: new ObjectId(postId) })

		return result.deletedCount === 1
	},

	mapDbPostToClientPost(DbPost: WithId<DBTypes.Post>): PostServiceModel {
		return {
			id: DbPost._id.toString(),
			title: DbPost.title,
			shortDescription: DbPost.shortDescription,
			content: DbPost.content,
			blogId: DbPost.blogId,
			blogName: DbPost.blogName,
			createdAt: DbPost.createdAt,
		}
	},
}
