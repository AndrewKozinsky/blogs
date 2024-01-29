import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { CreatePostDtoModel } from '../../src/models/input/posts.input.model'
import { GetPostCommentsOutModel } from '../../src/models/output/comments.output.model'
import { GetPostsOutModel } from '../../src/models/output/posts.output.model'
import { resetDbEveryTest } from './utils/common'
import {
	addBlogRequest,
	addPostCommentRequest,
	addPostRequest,
	addUserByAdminRequest,
	adminAuthorizationValue,
	checkCommentObj,
	checkPostObj,
	loginRequest,
	userEmail,
	userPassword,
} from './utils/utils'

resetDbEveryTest()

it.skip('123', async () => {
	expect(2).toBe(2)
})

describe('Getting post comments', () => {
	it.skip('should return an object with property items contains an empty array', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		const successAnswer: GetPostCommentsOutModel = {
			pagesCount: 0,
			page: 1,
			pageSize: 10,
			totalCount: 0,
			items: [],
		}

		await request(app)
			.get(RouteNames.postComments(postId))
			.expect(HTTP_STATUSES.OK_200, successAnswer)
	})

	it.skip('should return an object with property items contains array with 2 items after creating 2 comments', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// User on whose behalf comments will be created
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		const createdCommentOneRes = await addPostCommentRequest(app, userToken, postId)
		const createdCommentTwoRes = await addPostCommentRequest(app, userToken, postId)

		const getPostCommentsRes = await request(app)
			.get(RouteNames.postComments(postId))
			.expect(HTTP_STATUSES.OK_200)

		expect(getPostCommentsRes.body).toMatchObject({
			pagesCount: 1,
			page: 1,
			pageSize: 10,
			totalCount: 2,
			items: expect.any(Array),
		})

		checkCommentObj(
			getPostCommentsRes.body.items[0],
			createdUserRes.body.id,
			createdUserRes.body.login,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[1],
			createdUserRes.body.id,
			createdUserRes.body.login,
		)
	})

	it.skip('should return an array of objects matching the queries scheme', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// User on whose behalf comments will be created
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)

		const getPostCommentsRes = await request(app)
			.get(RouteNames.postComments(postId) + '?pageNumber=2&pageSize=2')
			.expect(HTTP_STATUSES.OK_200)

		expect(getPostCommentsRes.body).toMatchObject({
			pagesCount: 4,
			page: 2,
			pageSize: 2,
			totalCount: 7,
			items: expect.any(Array), //
		})

		expect(getPostCommentsRes.body.items.length).toBe(2)
	})
})

describe('Creating a comment', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app)
			.post(RouteNames.postComments('999'))
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not create a comment by wrong dto', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// User on whose behalf comments will be created
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		const createdCommentOneRes = await addPostCommentRequest(app, userToken, postId, {
			content: 'WRONG',
		})
		expect(createdCommentOneRes.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)
		expect(createdCommentOneRes.body).toMatchObject({
			errorsMessages: expect.any(Array),
		})
		expect(createdCommentOneRes.body.errorsMessages.length).toBe(1)
		expect(createdCommentOneRes.body.errorsMessages[0].field).toBe('content')
	})

	it.skip('should create a comment by correct dto', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// User on whose behalf comments will be created
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		const createdCommentOneRes = await addPostCommentRequest(app, userToken, postId, {
			content: 'Content min 20 characters',
		})

		checkCommentObj(
			createdCommentOneRes.body,
			createdUserRes.body.id,
			createdUserRes.body.login,
		)

		// Check if there are 2 posts after adding another one
		const createdCommentTwoRes = await addPostCommentRequest(app, userToken, postId, {
			content: 'Content min 22 characters',
		})
		expect(createdCommentTwoRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const getPostCommentsRes = await request(app)
			.get(RouteNames.postComments(postId))
			.expect(HTTP_STATUSES.OK_200)
		expect(getPostCommentsRes.body.items.length).toBe(2)
	})
})

describe('Getting all posts', () => {
	it.skip('should return an object with property items contains an empty array', async () => {
		const successAnswer: GetPostsOutModel = {
			pagesCount: 0,
			page: 1,
			pageSize: 10,
			totalCount: 0,
			items: [],
		}

		await request(app).get(RouteNames.posts).expect(HTTP_STATUSES.OK_200, successAnswer)
	})

	it.skip('should return an object with property items contains array with 2 items after creating 2 posts', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)

		const getPostsRes = await request(app).get(RouteNames.posts).expect(HTTP_STATUSES.OK_200)

		expect(getPostsRes.body.pagesCount).toBe(1)
		expect(getPostsRes.body.page).toBe(1)
		expect(getPostsRes.body.pageSize).toBe(10)
		expect(getPostsRes.body.totalCount).toBe(2)
		expect(getPostsRes.body.items.length).toBe(2)

		checkPostObj(getPostsRes.body.items[0])
		checkPostObj(getPostsRes.body.items[1])
	})

	it.skip('should return an array of objects matching the queries scheme', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)
		await addPostRequest(app, blogId)

		const getPostsRes = await request(app).get(RouteNames.posts + '?pageNumber=2&pageSize=2')

		expect(getPostsRes.body.page).toBe(2)
		expect(getPostsRes.body.pagesCount).toBe(4)
		expect(getPostsRes.body.totalCount).toBe(7)
		expect(getPostsRes.body.items.length).toBe(2)
	})
})

describe('Creating a post', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).post(RouteNames.posts).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not create a post by wrong dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId, { title: '' })
		expect(createdPostRes.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(createdPostRes.body.errorsMessages)).toBe('[object Array]')
		expect(createdPostRes.body.errorsMessages.length).toBe(1)
		expect(createdPostRes.body.errorsMessages[0].field).toBe('title')
	})

	it.skip('should create a post by correct dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)

		checkPostObj(createdPostRes.body)

		// Check if there are 2 posts after adding another one
		const createdPost2Res = await addPostRequest(app, blogId)
		expect(createdPost2Res.status).toBe(HTTP_STATUSES.CREATED_201)

		const allPostsRes = await request(app).get(RouteNames.posts)
		expect(allPostsRes.body.items.length).toBe(2)
	})
})

describe('Getting a post', () => {
	it.skip('should return 404 if a post does not exists', async () => {
		const getPostRes = await request(app).get(RouteNames.post('999'))

		expect(getPostRes.status).toBe(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should return an existing post', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdPostId = createdPostRes.body.id

		const getPostRes = await request(app).get(RouteNames.post(createdPostId))
		expect(getPostRes.status).toBe(HTTP_STATUSES.OK_200)

		checkPostObj(getPostRes.body)
	})
})

describe('Updating a post', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).put(RouteNames.post('999')).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not update a non existing post', async () => {
		await request(app)
			.post(RouteNames.post('999'))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should not update a post by wrong dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		const createdPostId = createdPostRes.body.id

		await request(app)
			.put(RouteNames.post(createdPostId))
			.send({})
			.set('authorization', adminAuthorizationValue)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should update a post by correct dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdPostId = createdPostRes.body.id

		const updatePostDto: CreatePostDtoModel = {
			title: 'UPDATED title',
			shortDescription: 'UPDATED shortDescription',
			content: 'UPDATED content',
			blogId,
		}

		await request(app)
			.put(RouteNames.post(createdPostId))
			.send(updatePostDto)
			.set('authorization', adminAuthorizationValue)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const getPostRes = await request(app).get(RouteNames.post(createdPostId))

		expect(getPostRes.status).toBe(HTTP_STATUSES.OK_200)
		expect(getPostRes.body.title).toBe(updatePostDto.title)
		expect(getPostRes.body.shortDescription).toBe(updatePostDto.shortDescription)
		expect(getPostRes.body.content).toBe(updatePostDto.content)
	})
})

describe('Deleting a post', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		return request(app).put(RouteNames.posts)
	})

	it.skip('should not delete a non existing post', async () => {
		await request(app)
			.delete(RouteNames.post('999'))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should delete a post', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdPostId = createdPostRes.body.id

		await request(app)
			.delete(RouteNames.post(createdPostId))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await request(app).get(RouteNames.post(createdPostId)).expect(HTTP_STATUSES.NOT_FOUNT_404)
	})
})
