import express from 'express'
import cookieParser from 'cookie-parser'
import RouteNames from './config/routeNames'
import requestsLimiter from './middlewares/requestsLimitter'
import getAuthRouter from './routes/auth.routes'
import getBlogsRouter from './routes/blogs.routes'
import getCommentsRouter from './routes/comments.routes'
import getPostsRouter from './routes/posts.routes'
import getSecurityRouter from './routes/security.routes'
import getTestRouter from './routes/test.routes'
import getUsersRouter from './routes/users.routes'

export const app = express()
app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', true)

app.use(RouteNames.blogs, getBlogsRouter())
app.use(RouteNames.posts, getPostsRouter())
app.use(RouteNames.users, getUsersRouter())
app.use(RouteNames.auth, getAuthRouter())
app.use(RouteNames.comments, getCommentsRouter())
app.use(RouteNames.security, getSecurityRouter())
app.use(RouteNames.testing, getTestRouter())

/*app.use((err: Error, req: Request, res: Response) => {
	console.log(err.message)
	res.status(500).send(err.message)
})*/
