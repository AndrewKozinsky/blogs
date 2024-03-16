import dotenv from 'dotenv'
import { Express } from 'express'
import request from 'supertest'
import { HTTP_STATUSES } from '../../../src/config/config'
import RouteNames from '../../../src/config/routeNames'
import { DBTypes } from '../../../src/db/dbTypes'
import {
	CreateBlogDtoModel,
	CreateBlogPostDtoModel,
} from '../../../src/models/input/blogs.input.model'
import {
	CreatePostCommentDtoModel,
	CreatePostDtoModel,
} from '../../../src/models/input/posts.input.model'
import { CreateUserDtoModel } from '../../../src/models/input/users.input.model'

dotenv.config()

export const adminAuthorizationValue = 'Basic YWRtaW46cXdlcnR5'
export const userLogin = 'my-login'
export const userEmail = 'mail@email.com'
export const userPassword = 'password'

export async function addBlogRequest(app: Express, blogDto: Partial<CreateBlogDtoModel> = {}) {
	return request(app)
		.post(RouteNames.blogs)
		.send(createDtoAddBlog(blogDto))
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		.set('authorization', adminAuthorizationValue)
}

export async function addBlogPostRequest(
	app: Express,
	blogId: string,
	postDto: Partial<CreateBlogPostDtoModel> = {},
) {
	const addBlogPostDto = createDtoAddBlogPost(postDto)

	return await request(app)
		.post(RouteNames.blogPosts(blogId))
		.send(addBlogPostDto)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		.set('authorization', adminAuthorizationValue)
}

export function createDtoAddBlog(newBlogObj: Partial<CreateBlogDtoModel> = {}): CreateBlogDtoModel {
	return Object.assign(
		{
			name: 'my name',
			description: 'my description',
			websiteUrl:
				'https://9DKoTEgTwRIyvI8-tVDUU2STaq3OG.e0d6f1EB3XsujFbOW53q5woGXMrAc5zXUnQxWvxsTS6a3zLYZdUWDt-BnXLEs1',
		},
		{ ...newBlogObj },
	)
}

export async function addPostRequest(
	app: Express,
	blogId: string,
	postDto: Partial<CreatePostDtoModel> = {},
) {
	return request(app)
		.post(RouteNames.posts)
		.set('authorization', adminAuthorizationValue)
		.send(createDtoAddPost(blogId, postDto))
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
}

export function createDtoAddPost(
	blogId: string,
	newPostObj: Partial<CreatePostDtoModel> = {},
): CreatePostDtoModel {
	return Object.assign(
		{
			title: 'title',
			shortDescription: 'shortDescription',
			content: 'content',
			blogId,
		},
		newPostObj,
	)
}

export function createDtoAddBlogPost(
	newPostObj: Partial<CreateBlogPostDtoModel> = {},
): CreateBlogPostDtoModel {
	return Object.assign(
		{
			title: 'title',
			shortDescription: 'shortDescription',
			content: 'content',
		},
		newPostObj,
	)
}

export function checkPostObj(
	postObj: any,
	likesCount: number,
	dislikesCount: number,
	currentUserLikeStatus: DBTypes.LikeStatuses,
) {
	expect(postObj._id).toBe(undefined)
	expect(typeof postObj.id).toBe('string')
	expect(typeof postObj.title).toBe('string')
	expect(typeof postObj.shortDescription).toBe('string')
	expect(typeof postObj.content).toBe('string')
	expect(typeof postObj.blogId).toBe('string')
	expect(typeof postObj.blogName).toBe('string')
	expect(postObj.createdAt).toMatch(
		/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	)
	expect(typeof postObj.extendedLikesInfo).toBe('object')
	expect(postObj.extendedLikesInfo.likesCount).toBe(likesCount)
	expect(postObj.extendedLikesInfo.dislikesCount).toBe(dislikesCount)
	expect(postObj.extendedLikesInfo.myStatus).toBe(currentUserLikeStatus)
	expect(typeof postObj.extendedLikesInfo).toBe('object')
	expect({}.toString.call(postObj.extendedLikesInfo.newestLikes)).toBe('[object Array]')

	if (postObj.extendedLikesInfo.newestLikes.length) {
		expect(postObj.extendedLikesInfo.newestLikes[0].addedAt).toMatch(
			/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
		)
		expect(typeof postObj.extendedLikesInfo.newestLikes[0].userId).toBe('string')
		expect(typeof postObj.extendedLikesInfo.newestLikes[0].login).toBe('string')
	}
}

export async function addUserByAdminRequest(
	app: Express,
	userDto: Partial<CreateUserDtoModel> = {},
) {
	// Register user
	return await request(app)
		.post(RouteNames.users)
		.send(createDtoAddUser(userDto))
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		.set('authorization', adminAuthorizationValue)
}

export function createDtoAddUser(newUserObj: Partial<CreateUserDtoModel> = {}): CreateUserDtoModel {
	return Object.assign(
		{
			login: userLogin,
			password: userPassword,
			email: userEmail,
		},
		newUserObj,
	)
}

export function checkUserObj(userObj: any) {
	expect(userObj._id).toBe(undefined)
	expect(typeof userObj.id).toBe('string')
	expect(userObj.login).toMatch(/^[a-zA-Z0-9_-]*$/)
	expect(typeof userObj.email).toBe('string')
	expect(userObj.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
	expect(userObj.createdAt).toMatch(
		/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	)
}

export function checkUserDeviceObj(userDeviceObj: any) {
	expect(userDeviceObj).toEqual({
		ip: expect.any(String),
		title: expect.any(String),
		lastActiveDate: expect.any(String),
		deviceId: expect.any(String),
	})

	expect(userDeviceObj.lastActiveDate).toMatch(
		/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	)
}

export function loginRequest(app: Express, loginOrEmail: string, password: string) {
	return request(app).post(RouteNames.authLogin).send({ loginOrEmail, password })
}

export async function addPostCommentRequest(
	app: Express,
	userAuthorizationToken: string,
	postId: string,
	commentDto: Partial<CreatePostCommentDtoModel> = {},
) {
	return request(app)
		.post(RouteNames.postComments(postId))
		.send(createDtoAddPostComment(commentDto))
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		.set('authorization', 'Bearer ' + userAuthorizationToken)
}

export function createDtoAddPostComment(
	newCommentObj: Partial<CreatePostCommentDtoModel> = {},
): CreatePostCommentDtoModel {
	return Object.assign(
		{
			content: 'new content min 20 characters',
		},
		newCommentObj,
	)
}

export function checkCommentObj(
	commentObj: any,
	userId: string,
	userLogin: string,
	likesCount: number,
	dislikesCount: number,
	currentUserLikeStatus: DBTypes.LikeStatuses,
) {
	expect(commentObj).toEqual({
		id: commentObj.id,
		content: commentObj.content,
		commentatorInfo: {
			userId,
			userLogin,
		},
		createdAt: expect.any(String),
		likesInfo: {
			likesCount,
			dislikesCount,
			myStatus: currentUserLikeStatus,
		},
	})

	expect(commentObj.createdAt).toMatch(
		/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	)
}
