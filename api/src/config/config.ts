export const config = {
	port: 3000,
	refreshToken: {
		name: 'refreshToken',
		lifeDurationInMs: 1000 * 20, // 20 seconds
	},
	accessToken: {
		name: 'accessToken',
		lifeDurationInMs: 1000 * 10, // 10 seconds
	},
}

export const HTTP_STATUSES = {
	OK_200: 200,
	CREATED_201: 201,
	NO_CONTENT_204: 204,

	BAD_REQUEST_400: 400,
	UNAUTHORIZED_401: 401,
	FORBIDDEN_403: 403,
	NOT_FOUNT_404: 404,
	TOO_MANY_REQUESTS_429: 429,

	SERVER_ERROR_500: 500,
}
