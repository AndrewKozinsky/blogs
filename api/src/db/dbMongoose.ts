import mongoose, { Schema } from 'mongoose'
import DbNames from './dbNames'
import { DBTypes } from './dbTypes'

export const BlogSchema = new mongoose.Schema<DBTypes.Blog>({
	name: { type: String, require: true },
	description: { type: String, require: true },
	websiteUrl: { type: String, require: true },
	createdAt: { type: String, require: true },
	isMembership: { type: Boolean, require: true },
})

export const BlogModel = mongoose.model<DBTypes.Blog>(DbNames.blogs, BlogSchema)

// --------

export const PostSchema = new mongoose.Schema<DBTypes.Post>({
	title: { type: String, require: true },
	shortDescription: { type: String, require: true },
	content: { type: String, require: true },
	blogId: { type: String, require: true },
	blogName: { type: String, require: true },
	createdAt: { type: String, require: true },
})

export const PostModel = mongoose.model<DBTypes.Post>(DbNames.posts, PostSchema)

// --------

export const UserSchema = new mongoose.Schema<DBTypes.User>({
	account: {
		login: { type: String, require: true },
		email: { type: String, require: true },
		password: { type: String, require: true },
		passwordRecoveryCode: { type: String, require: false },
		createdAt: { type: String, require: true },
	},
	emailConfirmation: {
		confirmationCode: { type: String, require: true },
		expirationDate: { type: Date, require: true },
		isConfirmed: { type: Boolean, require: true },
	},
})

export const UserModel = mongoose.model<DBTypes.User>(DbNames.users, UserSchema)

// --------

export const CommentSchema = new mongoose.Schema<DBTypes.Comment>({
	id: { type: String, require: true },
	postId: { type: String, require: true },
	content: { type: String, require: true },
	commentatorInfo: {
		userId: { type: String, require: true },
		userLogin: { type: String, require: true },
	},
	createdAt: { type: String, require: true },
})

export const CommentModel = mongoose.model<DBTypes.Comment>(DbNames.comments, CommentSchema)

// --------

export const CommentLikeSchema = new mongoose.Schema<DBTypes.CommentLike>({
	commentId: { type: String, require: true },
	userId: { type: String, require: true },
	status: { type: String, enum: ['None', 'Like', 'Dislike'], require: true },
})

export const CommentLikeModel = mongoose.model<DBTypes.CommentLike>(
	DbNames.commentLike,
	CommentLikeSchema,
)

// --------

export const DeviceTokenSchema = new mongoose.Schema<DBTypes.DeviceToken>({
	issuedAt: { type: Date, require: true },
	expirationDate: { type: Date, require: true },
	deviceIP: { type: String, require: true },
	deviceId: { type: String, require: true },
	deviceName: { type: String, require: true },
	userId: { type: String, require: true },
})

export const DeviceTokenModel = mongoose.model<DBTypes.DeviceToken>(
	DbNames.deviceRefreshTokens,
	DeviceTokenSchema,
)

// --------

export const RateLimitSchema = new mongoose.Schema<DBTypes.RateLimit>({
	ip: { type: String, require: true },
	date: { type: Date, require: true },
	path: { type: String, require: true },
	method: { type: String, require: true },
})

export const RateLimitModel = mongoose.model<DBTypes.RateLimit>(DbNames.rateLimit, RateLimitSchema)
