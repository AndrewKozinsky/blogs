import { injectable } from 'inversify'
import { ObjectId, WithId } from 'mongodb'
import { BlogModel } from '../db/dbMongoose'
import { DBTypes } from '../db/dbTypes'
import { UpdateBlogDtoModel } from '../models/input/blogs.input.model'
import { CreateBlogOutModel } from '../models/output/blogs.output.model'
import { BlogServiceModel } from '../models/service/blogs.service.model'

@injectable()
export class BlogsRepository {
	async getBlogs() {
		const getBlogsRes = await BlogModel.find({}).lean()

		return getBlogsRes.map(this.mapDbBlogToServiceBlog)
	}

	async getBlogById(blogId: string) {
		if (!ObjectId.isValid(blogId)) {
			return null
		}

		const getBlogRes = await BlogModel.findOne({ _id: new ObjectId(blogId) }).lean()

		return getBlogRes ? this.mapDbBlogToServiceBlog(getBlogRes) : null
	}
	async createBlog(dto: CreateBlogOutModel) {
		const createBlogRes = await BlogModel.create({ ...dto, isMembership: false })

		return createBlogRes.id
	}

	async updateBlog(blogId: string, updateBlogDto: UpdateBlogDtoModel): Promise<boolean> {
		if (!ObjectId.isValid(blogId)) {
			return false
		}

		const updateBlogRes = await BlogModel.updateOne(
			{ _id: new ObjectId(blogId) },
			{ $set: updateBlogDto },
		)

		return updateBlogRes.modifiedCount === 1
	}

	async deleteBlog(blogId: string): Promise<boolean> {
		if (!ObjectId.isValid(blogId)) {
			return false
		}

		const result = await BlogModel.deleteOne({ _id: new ObjectId(blogId) })

		return result.deletedCount === 1
	}

	mapDbBlogToServiceBlog(DbBlog: WithId<DBTypes.Blog>): BlogServiceModel {
		return {
			id: DbBlog._id.toString(),
			name: DbBlog.name,
			description: DbBlog.description,
			websiteUrl: DbBlog.websiteUrl,
			createdAt: DbBlog.createdAt,
			isMembership: DbBlog.isMembership,
		}
	}
}
