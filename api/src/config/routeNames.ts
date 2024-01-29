const RouteNames = {
	blogs: '/blogs',
	blog(id: string) {
		return '/blogs/' + id
	},
	blogPosts(blogId: string) {
		return '/blogs/' + blogId + '/posts'
	},
	posts: '/posts',
	post(postId: string) {
		return '/posts/' + postId
	},
	postComments(postId: string) {
		return '/posts/' + postId + '/comments'
	},
	users: '/users',
	user(id: string) {
		return '/users/' + id
	},

	auth: '/auth',
	authLogin: '/auth/login',
	authRegistration: '/auth/registration',
	authRegistrationEmailResending: '/auth/registration-email-resending',
	authRegistrationConfirmation: '/auth/registration-confirmation',
	authMe: '/auth/me',

	comments: '/comments',
	comment(commentId: string) {
		return '/comments/' + commentId
	},
	testing: '/testing',
	testingAllData: '/testing/all-data',
}

export default RouteNames
