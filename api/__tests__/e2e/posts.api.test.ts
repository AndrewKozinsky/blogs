// @ts-ignore
import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { DBTypes } from '../../src/db/dbTypes'
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

/*describe('Getting post comments', () => {
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

		await addPostCommentRequest(app, userToken, postId)
		await addPostCommentRequest(app, userToken, postId)

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
			0,
			0,
			DBTypes.LikeStatuses.None,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[1],
			createdUserRes.body.id,
			createdUserRes.body.login,
			0,
			0,
			DBTypes.LikeStatuses.None,
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

	it('create 6 comments then: like comment 1 by user 1, user 2; like comment 2 by user 2, user 3; dislike comment 3 by user 1; like comment 4 by user 1, user 4, user 2, user 3; like comment 5 by user 2, dislike by user 3; like comment 6 by user 1, dislike by user 2.', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// Users and their tokens
		let user1Token = ''
		let user1Id = ''
		let user1Login = ''
		let user2Token = ''
		let user2Id = ''
		let user3Token = ''
		let user3Id = ''
		let user4Token = ''
		let user4Id = ''

		for (let i = 1; i <= 4; i++) {
			const login = 'login-' + i
			const password = 'password-' + i
			const email = `email-${i}@mail.com`

			const createdUserRes = await addUserByAdminRequest(app, {
				login,
				password,
				email,
			})
			expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
			const loginUserRes = await loginRequest(app, email, password)
			const token = loginUserRes.body.accessToken

			if (i == 1) {
				user1Token = token
				user1Id = createdUserRes.body.id
				user1Login = createdUserRes.body.login
			} else if (i == 2) {
				user2Token = token
				user2Id = createdUserRes.body.id
			} else if (i == 3) {
				user3Token = token
				user3Id = createdUserRes.body.id
			} else if (i == 4) {
				user4Token = token
				user4Id = createdUserRes.body.id
			}
		}

		// Create post comments
		const comment1Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 1',
		})
		const comment1Id = comment1Res.body.id
		const comment2Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 2',
		})
		const comment2Id = comment2Res.body.id
		const comment3Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 3',
		})
		const comment3Id = comment3Res.body.id
		const comment4Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 4',
		})
		const comment4Id = comment4Res.body.id
		const comment5Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 5',
		})
		const comment5Id = comment5Res.body.id
		const comment6Res = await addPostCommentRequest(app, user1Token, postId, {
			content: 'new content min 20 characters 6',
		})
		const comment6Id = comment6Res.body.id

		async function setLikeStatus(
			userToken: string,
			commentId: string,
			likeStatus: DBTypes.LikeStatuses,
		) {
			await request(app)
				.put(RouteNames.commentLikeStatus(commentId))
				.set('authorization', 'Bearer ' + userToken)
				.send(JSON.stringify({ likeStatus }))
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.expect(HTTP_STATUSES.NO_CONTENT_204)
		}

		// Set a like statuses to the comments
		await setLikeStatus(user1Token, comment1Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, comment1Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, comment2Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, comment2Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user1Token, comment3Id, DBTypes.LikeStatuses.Dislike)
		await setLikeStatus(user1Token, comment4Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user4Token, comment4Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, comment4Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, comment4Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, comment5Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, comment5Id, DBTypes.LikeStatuses.Dislike)
		await setLikeStatus(user1Token, comment6Id, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, comment6Id, DBTypes.LikeStatuses.Dislike)

		const getPostCommentsRes = await request(app)
			.get(RouteNames.postComments(postId, '?sortDirection=asc'))
			.set('authorization', 'Bearer ' + user1Token)
			.expect(HTTP_STATUSES.OK_200)

		expect(getPostCommentsRes.body).toMatchObject({
			pagesCount: 1,
			page: 1,
			pageSize: 10,
			totalCount: 6,
			items: expect.any(Array),
		})

		checkCommentObj(
			getPostCommentsRes.body.items[0],
			user1Id,
			user1Login,
			2,
			0,
			DBTypes.LikeStatuses.Like,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[1],
			user1Id,
			user1Login,
			2,
			0,
			DBTypes.LikeStatuses.None,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[2],
			user1Id,
			user1Login,
			0,
			1,
			DBTypes.LikeStatuses.Dislike,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[3],
			user1Id,
			user1Login,
			4,
			0,
			DBTypes.LikeStatuses.Like,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[4],
			user1Id,
			user1Login,
			1,
			1,
			DBTypes.LikeStatuses.None,
		)
		checkCommentObj(
			getPostCommentsRes.body.items[5],
			user1Id,
			user1Login,
			1,
			1,
			DBTypes.LikeStatuses.Like,
		)
	})
})*/

/*describe('Creating a comment', () => {
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
			0,
			0,
			DBTypes.LikeStatuses.None,
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
})*/

/*describe('Getting all posts', () => {
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
})*/

/*describe('Creating a post', () => {
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
})*/

/*describe('Getting a post', () => {
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
})*/

/*describe('Updating a post', () => {
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
})*/

/*describe('Deleting a post', () => {
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
})*/

describe('Make a post like status', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app)
			.put(RouteNames.postLikeStatus('999'))
			.expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should return 404 if a post does not exists', async () => {
		// User will create a post
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		await request(app)
			.put(RouteNames.postLikeStatus('999'))
			.set('authorization', 'Bearer ' + userToken)
			.send(JSON.stringify({ likeStatus: 'None' }))
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should return 400 if requst body does not exist', async () => {
		// User will create a comment
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		await request(app)
			.put(RouteNames.postLikeStatus('999'))
			.set('authorization', 'Bearer ' + userToken)
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should return 204 if pass right body data to right address', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post in the blog
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// Create a user on behalf of which requests will be made
		const createdUserRes = await addUserByAdminRequest(app)
		expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const loginUserRes = await loginRequest(app, userEmail, userPassword)
		const userToken = loginUserRes.body.accessToken

		// Set a like status to the post
		await request(app)
			.put(RouteNames.postLikeStatus(postId))
			.set('authorization', 'Bearer ' + userToken)
			.send(JSON.stringify({ likeStatus: DBTypes.LikeStatuses.Like }))
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		// Get the post again to check a returned object
		const getPostRes = await request(app)
			.get(RouteNames.post(postId))
			.expect(HTTP_STATUSES.OK_200)

		checkPostObj(getPostRes.body, 1, 0, DBTypes.LikeStatuses.None)
	})

	it('create post and make a few likes from different users', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create a post
		const createdPostRes = await addPostRequest(app, blogId)
		expect(createdPostRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const postId = createdPostRes.body.id

		// Users and their tokens
		let user1Token = ''
		let user1Id = ''
		let user1Login = ''
		let user2Token = ''
		let user2Id = ''
		let user3Token = ''
		let user3Id = ''
		let user4Token = ''
		let user4Id = ''

		for (let i = 1; i <= 4; i++) {
			const login = 'login-' + i
			const password = 'password-' + i
			const email = `email-${i}@mail.com`

			const createdUserRes = await addUserByAdminRequest(app, {
				login,
				password,
				email,
			})
			expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
			const loginUserRes = await loginRequest(app, email, password)
			const token = loginUserRes.body.accessToken

			if (i == 1) {
				user1Token = token
				user1Id = createdUserRes.body.id
				user1Login = createdUserRes.body.login
			} else if (i == 2) {
				user2Token = token
				user2Id = createdUserRes.body.id
			} else if (i == 3) {
				user3Token = token
				user3Id = createdUserRes.body.id
			} else if (i == 4) {
				user4Token = token
				user4Id = createdUserRes.body.id
			}
		}

		async function setLikeStatus(userToken: string, likeStatus: DBTypes.LikeStatuses) {
			await request(app)
				.put(RouteNames.postLikeStatus(postId))
				.set('authorization', 'Bearer ' + userToken)
				.send(JSON.stringify({ likeStatus }))
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.expect(HTTP_STATUSES.NO_CONTENT_204)
		}

		// Set a like statuses to the post
		await setLikeStatus(user1Token, DBTypes.LikeStatuses.Like)

		// Get the post again by an unauthorized user to check a returned object
		let getPostRes = await request(app)
			.get(RouteNames.post(postId))
			.expect(HTTP_STATUSES.OK_200)

		checkPostObj(getPostRes.body, 1, 0, DBTypes.LikeStatuses.None)

		// Get the post again by an authorized user to check a returned object
		getPostRes = await request(app)
			.get(RouteNames.post(postId))
			.set('authorization', 'Bearer ' + user1Token)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.OK_200)

		checkPostObj(getPostRes.body, 1, 0, DBTypes.LikeStatuses.Like)

		// Set a like statuses to the post
		await setLikeStatus(user2Token, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user4Token, DBTypes.LikeStatuses.Like)

		// Get the post again by an authorized user to check a returned object
		getPostRes = await request(app)
			.get(RouteNames.post(postId))
			.set('authorization', 'Bearer ' + user2Token)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.OK_200)

		checkPostObj(getPostRes.body, 4, 0, DBTypes.LikeStatuses.Like)
		expect(getPostRes.body.extendedLikesInfo.newestLikes.length).toBe(3)

		// Check extendedLikesInfo order
		expect(getPostRes.body.extendedLikesInfo.newestLikes[0].userId).toBe(user4Id)
		expect(getPostRes.body.extendedLikesInfo.newestLikes[1].userId).toBe(user3Id)
		expect(getPostRes.body.extendedLikesInfo.newestLikes[2].userId).toBe(user2Id)
	})

	it('create 6 posts then: like post 1 by user 1, user 2; like post 2 by user 2, user 3; dislike post 3 by user 1; like post 4 by user 1, user 4, user 2, user 3; like post 5 by user 2, dislike by user 3; like post 6 by user 1, dislike by user 2. Get the posts by user 1 after all likes NewestLikes should be sorted in descending', async () => {
		// Create a blog
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const blogId = createdBlogRes.body.id

		// Create posts
		const createdPost1Res = await addPostRequest(app, blogId)
		const createdPost2Res = await addPostRequest(app, blogId)
		const createdPost3Res = await addPostRequest(app, blogId)
		const createdPost4Res = await addPostRequest(app, blogId)
		const createdPost5Res = await addPostRequest(app, blogId)
		const createdPost6Res = await addPostRequest(app, blogId)
		const postId1 = createdPost1Res.body.id
		const postId2 = createdPost2Res.body.id
		const postId3 = createdPost3Res.body.id
		const postId4 = createdPost4Res.body.id
		const postId5 = createdPost5Res.body.id
		const postId6 = createdPost6Res.body.id

		// Users and their tokens
		let user1Token = ''
		let user1Id = ''
		let user1Login = ''
		let user2Token = ''
		let user2Id = ''
		let user3Token = ''
		let user3Id = ''
		let user4Token = ''
		let user4Id = ''

		for (let i = 1; i <= 4; i++) {
			const login = 'login-' + i
			const password = 'password-' + i
			const email = `email-${i}@mail.com`

			const createdUserRes = await addUserByAdminRequest(app, {
				login,
				password,
				email,
			})
			expect(createdUserRes.status).toBe(HTTP_STATUSES.CREATED_201)
			const loginUserRes = await loginRequest(app, email, password)
			const token = loginUserRes.body.accessToken

			if (i == 1) {
				user1Token = token
				user1Id = createdUserRes.body.id
				user1Login = createdUserRes.body.login
			} else if (i == 2) {
				user2Token = token
				user2Id = createdUserRes.body.id
			} else if (i == 3) {
				user3Token = token
				user3Id = createdUserRes.body.id
			} else if (i == 4) {
				user4Token = token
				user4Id = createdUserRes.body.id
			}
		}

		async function setLikeStatus(
			userToken: string,
			postId: string,
			likeStatus: DBTypes.LikeStatuses,
		) {
			await request(app)
				.put(RouteNames.postLikeStatus(postId))
				.set('authorization', 'Bearer ' + userToken)
				.send(JSON.stringify({ likeStatus }))
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.expect(HTTP_STATUSES.NO_CONTENT_204)
		}

		// Set a like statuses to the posts
		await setLikeStatus(user1Token, postId1, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, postId1, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, postId2, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, postId2, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user1Token, postId3, DBTypes.LikeStatuses.Dislike)
		await setLikeStatus(user1Token, postId4, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user4Token, postId4, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, postId4, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, postId4, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user2Token, postId5, DBTypes.LikeStatuses.Like)
		await setLikeStatus(user3Token, postId5, DBTypes.LikeStatuses.Dislike)
		await setLikeStatus(user1Token, postId6, DBTypes.LikeStatuses.Like)

		// Get the posts by user 1 after all likes NewestLikes should be sorted in descending
		const getPostsRes = await request(app)
			.get(RouteNames.posts)
			.set('authorization', 'Bearer ' + user1Token)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.OK_200)

		expect(getPostsRes.body.items.length).toBe(6)
	})
})
