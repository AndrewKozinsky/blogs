import request from 'supertest'
import { app } from '../../src/app'
import { HTTP_STATUSES } from '../../src/config/config'
import RouteNames from '../../src/config/routeNames'
import { CreateBlogDtoModel } from '../../src/models/input/blogs.input.model'
import { GetBlogsOutModel } from '../../src/models/output/blogs.output.model'
import { GetPostsOutModel } from '../../src/models/output/posts.output.model'
import { resetDbEveryTest } from './utils/common'
import {
	addBlogPostRequest,
	addBlogRequest,
	adminAuthorizationValue,
	checkPostObj,
	createDtoAddBlogPost,
} from './utils/utils'

resetDbEveryTest()

it.skip('123', async () => {
	expect(2).toBe(2)
})

describe('Getting all blogs', () => {
	it.skip('should return an object with property items contains an empty array', async () => {
		const successAnswer: GetBlogsOutModel = {
			pagesCount: 0,
			page: 1,
			pageSize: 10,
			totalCount: 0,
			items: [],
		}

		await request(app).get(RouteNames.blogs).expect(HTTP_STATUSES.OK_200, successAnswer)
	})

	it.skip('should return an object with property items contains array with 2 items after creating 2 blogs', async () => {
		await addBlogRequest(app)
		await addBlogRequest(app)

		const getBlogsRes = await request(app).get(RouteNames.blogs).expect(HTTP_STATUSES.OK_200)

		expect(getBlogsRes.body.pagesCount).toBe(1)
		expect(getBlogsRes.body.page).toBe(1)
		expect(getBlogsRes.body.pageSize).toBe(10)
		expect(getBlogsRes.body.totalCount).toBe(2)
		expect(getBlogsRes.body.items.length).toBe(2)

		checkBlogObj(getBlogsRes.body.items[0])
		checkBlogObj(getBlogsRes.body.items[1])
	})

	it.skip('should return an object with properties with specific values after creating 5 blogs', async () => {
		await addBlogRequest(app)
		await addBlogRequest(app)
		await addBlogRequest(app)
		await addBlogRequest(app)
		await addBlogRequest(app)
		await addBlogRequest(app)
		await addBlogRequest(app)

		const getBlogsRes = await request(app).get(RouteNames.blogs + '?pageNumber=2&pageSize=2')

		expect(getBlogsRes.body.page).toBe(2)
		expect(getBlogsRes.body.pagesCount).toBe(4)
		expect(getBlogsRes.body.totalCount).toBe(7)
		expect(getBlogsRes.body.items.length).toBe(2)
	})
})

describe('Creating a blog', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).post(RouteNames.blogs).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not create a blog by wrong dto', async () => {
		const createdBlogRes = await addBlogRequest(app, { websiteUrl: 'samurai.it-incubator' })
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.BAD_REQUEST_400)

		expect({}.toString.call(createdBlogRes.body.errorsMessages)).toBe('[object Array]')
		expect(createdBlogRes.body.errorsMessages.length).toBe(1)
		expect(createdBlogRes.body.errorsMessages[0].field).toBe('websiteUrl')
	})

	it.skip('should create a blog by correct dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)

		checkBlogObj(createdBlogRes.body)

		// Check if there are 2 blogs after adding another one
		const createdSecondBlogRes = await addBlogRequest(app)
		expect(createdSecondBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const allBlogsRes = await request(app).get(RouteNames.blogs)
		expect(allBlogsRes.body.items.length).toBe(2)
	})
})

describe('Getting a blog', () => {
	it.skip("should return a 404 if a blog doesn't exists", async () => {
		await request(app).get(RouteNames.blog('999')).expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should return an existing blog', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const createdBlogId = createdBlogRes.body.id

		const getBlogRes = await request(app).get(RouteNames.blog(createdBlogId))
		expect(getBlogRes.status).toBe(HTTP_STATUSES.OK_200)
		checkBlogObj(getBlogRes.body)
	})
})

describe('Getting a blog posts', () => {
	it.skip("should return a 404 if a blog doesn't exists", async () => {
		await request(app).get(RouteNames.blogPosts('999')).expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should return an object with property items contains an empty array', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		const successAnswer: GetPostsOutModel = {
			pagesCount: 0,
			page: 1,
			pageSize: 10,
			totalCount: 0,
			items: [],
		}

		await request(app)
			.get(RouteNames.blogPosts(blogId))
			.expect(HTTP_STATUSES.OK_200, successAnswer)
	})

	it.skip('should return an object with property items contains array with 2 items after creating 2 blog posts', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)

		const getBlogPostsRes = await request(app)
			.get(RouteNames.blogPosts(blogId))
			.expect(HTTP_STATUSES.OK_200)

		expect(getBlogPostsRes.body.pagesCount).toBe(1)
		expect(getBlogPostsRes.body.page).toBe(1)
		expect(getBlogPostsRes.body.pageSize).toBe(10)
		expect(getBlogPostsRes.body.totalCount).toBe(2)
		expect(getBlogPostsRes.body.items.length).toBe(2)

		checkPostObj(getBlogPostsRes.body.items[0])
		checkPostObj(getBlogPostsRes.body.items[1])
	})

	it.skip('should return an object with properties with specific values after creating 5 blog posts', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const blogId = createdBlogRes.body.id

		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)
		await addBlogPostRequest(app, blogId)

		const getBlogsRes = await request(app).get(
			RouteNames.blogPosts(blogId) + '?pageNumber=2&pageSize=2',
		)

		expect(getBlogsRes.body.page).toBe(2)
		expect(getBlogsRes.body.pagesCount).toBe(4)
		expect(getBlogsRes.body.totalCount).toBe(7)
		expect(getBlogsRes.body.items.length).toBe(2)
	})
})

describe('Updating a blog', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).put(RouteNames.blog('999')).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('should not update a non existing blog', async () => {
		await request(app)
			.post(RouteNames.blog('999'))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should not update a blog by wrong dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		const createdBlogId = createdBlogRes.body.id

		await request(app)
			.put(RouteNames.blog(createdBlogId))
			.send({})
			.set('authorization', adminAuthorizationValue)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.BAD_REQUEST_400)
	})

	it.skip('should update a blog by correct dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdBlogId = createdBlogRes.body.id

		const updateBlogDto: CreateBlogDtoModel = {
			name: 'my UPDATED name',
			description: 'my UPDATED description',
			websiteUrl:
				'https://9DKoTEgTwRIyvI8-tVDUU2STaq3OG.e0d6f1EB3XsujFbOW53q5woGXMrAc5zXUnQxWvxsTS6a3zLYZdUWDt-',
		}

		await request(app)
			.put(RouteNames.blog(createdBlogId))
			.send(updateBlogDto)
			.set('authorization', adminAuthorizationValue)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		const getBlogRes = await request(app).get(RouteNames.blog(createdBlogId))

		expect(getBlogRes.status).toBe(HTTP_STATUSES.OK_200)
		expect(getBlogRes.body.name).toBe(updateBlogDto.name)
		expect(getBlogRes.body.description).toBe(updateBlogDto.description)
		expect(getBlogRes.body.websiteUrl).toBe(updateBlogDto.websiteUrl)
	})
})

describe('Create a blog post', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		await request(app).post(RouteNames.blogPosts('999')).expect(HTTP_STATUSES.UNAUTHORIZED_401)
	})

	it.skip('forbid to create a blog post by wrong blog id', async () => {
		const addBlogPostDto = createDtoAddBlogPost()

		return await request(app)
			.post(RouteNames.blogPosts('999'))
			.send(addBlogPostDto)
			.set('authorization', adminAuthorizationValue)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('create a blog post by wrong dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const addBlogPostRes = await addBlogPostRequest(app, createdBlogRes.body.id, { title: '' })

		expect({}.toString.call(addBlogPostRes.body.errorsMessages)).toBe('[object Array]')
		expect(addBlogPostRes.body.errorsMessages.length).toBe(1)
		expect(addBlogPostRes.body.errorsMessages[0].field).toBe('title')
	})

	it.skip('should create a blog post by correct dto', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const createBlogPostRes = await addBlogPostRequest(app, createdBlogRes.body.id)

		checkPostObj(createBlogPostRes.body)

		// Check if there are 2 blog posts after adding another one
		const createdSecondBlogPostRes = await addBlogPostRequest(app, createdBlogRes.body.id)
		expect(createdSecondBlogPostRes.status).toBe(HTTP_STATUSES.CREATED_201)

		const allBlogPostsRes = await request(app).get(RouteNames.blogPosts(createdBlogRes.body.id))
		expect(allBlogPostsRes.body.items.length).toBe(2)
	})
})

describe('Deleting a blog', () => {
	it.skip('should forbid a request from an unauthorized user', async () => {
		return request(app).delete(RouteNames.blogs)
	})

	it.skip('should not delete a non existing blog', async () => {
		await request(app)
			.delete(RouteNames.blog('999'))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NOT_FOUNT_404)
	})

	it.skip('should delete a blog', async () => {
		const createdBlogRes = await addBlogRequest(app)
		expect(createdBlogRes.status).toBe(HTTP_STATUSES.CREATED_201)
		const createdBlogId = createdBlogRes.body.id

		await request(app)
			.delete(RouteNames.blog(createdBlogId))
			.set('authorization', adminAuthorizationValue)
			.expect(HTTP_STATUSES.NO_CONTENT_204)

		await request(app).get(RouteNames.blog(createdBlogId)).expect(HTTP_STATUSES.NOT_FOUNT_404)
	})
})

function checkBlogObj(blogObj: any) {
	expect(typeof blogObj._id).toBe('undefined')
	expect(typeof blogObj.id).toBe('string')
	expect(typeof blogObj.name).toBe('string')
	expect(typeof blogObj.description).toBe('string')
	expect(blogObj.createdAt).toMatch(
		/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
	)
	expect(typeof blogObj.websiteUrl).toBe('string')
	expect(blogObj.isMembership).toBe(false)
}
