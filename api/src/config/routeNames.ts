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
	postComments(postId: string, tail: string = '') {
		return '/posts/' + postId + '/comments' + tail
	},
	postLikeStatus(postId: string) {
		return '/posts/' + postId + '/like-status'
	},
	users: '/users',
	user(id: string) {
		return '/users/' + id
	},

	auth: '/auth',
	authLogin: '/auth/login',
	authRefreshToken: '/auth/refresh-token',
	authRegistration: '/auth/registration',
	authRegistrationEmailResending: '/auth/registration-email-resending',
	authRegistrationConfirmation: '/auth/registration-confirmation',
	authLogout: '/auth/logout',
	authPasswordRecovery: '/auth/password-recovery',
	authNewPassword: '/auth/new-password',
	authMe: '/auth/me',

	comments: '/comments',
	comment(commentId: string) {
		return '/comments/' + commentId
	},
	commentLikeStatus(commentId: string) {
		return '/comments/' + commentId + '/like-status'
	},
	security: '/security',
	securityDevices: '/security/devices',
	securityDevice(deviceId: string) {
		return '/security/devices/' + deviceId
	},
	testing: '/testing',
	testingAllData: '/testing/all-data',
}

export default RouteNames
