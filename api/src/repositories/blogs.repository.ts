import { ObjectId, WithId } from 'mongodb'
import DbNames from '../config/dbNames'
import { DBTypes } from '../models/db'
import { UpdateBlogDtoModel } from '../models/input/blogs.input.model'
import { CreateBlogOutModel } from '../models/output/blogs.output.model'
import { BlogServiceModel } from '../models/service/blogs.service.model'
import { db } from '../db/dbService'

export const blogsRepository = {
	async getBlogs() {
		const getBlogsRes = await db.collection<DBTypes.Blog>(DbNames.blogs).find({}).toArray()

		return getBlogsRes.map(this.mapDbBlogToServiceBlog)
	},
	async getBlogById(blogId: string) {
		if (!ObjectId.isValid(blogId)) {
			return null
		}

		const getBlogRes = await db
			.collection<DBTypes.Blog>(DbNames.blogs)
			.findOne({ _id: new ObjectId(blogId) })

		return getBlogRes ? this.mapDbBlogToServiceBlog(getBlogRes) : null
	},
	async createBlog(dto: CreateBlogOutModel) {
		const createBlogRes = await db
			.collection(DbNames.blogs)
			.insertOne({ ...dto, isMembership: false })

		return createBlogRes.insertedId.toString()
	},

	async updateBlog(blogId: string, updateBlogDto: UpdateBlogDtoModel): Promise<boolean> {
		if (!ObjectId.isValid(blogId)) {
			return false
		}

		const updateBlogRes = await db
			.collection<DBTypes.Blog>(DbNames.blogs)
			.updateOne({ _id: new ObjectId(blogId) }, { $set: updateBlogDto })

		return updateBlogRes.modifiedCount === 1
	},

	async deleteBlog(blogId: string): Promise<boolean> {
		if (!ObjectId.isValid(blogId)) {
			return false
		}

		const result = await db.collection(DbNames.blogs).deleteOne({ _id: new ObjectId(blogId) })

		return result.deletedCount === 1
	},

	mapDbBlogToServiceBlog(DbBlog: WithId<DBTypes.Blog>): BlogServiceModel {
		return {
			id: DbBlog._id.toString(),
			name: DbBlog.name,
			description: DbBlog.description,
			websiteUrl: DbBlog.websiteUrl,
			createdAt: DbBlog.createdAt,
			isMembership: DbBlog.isMembership,
		}
	},
}
