import express from 'express'
import cookieParser from 'cookie-parser'
import RouteNames from './config/routeNames'
import getAuthRouter from './routes/auth.getRouter'
import getBlogsRouter from './routes/blogs.getRouter'
import getCommentsRouter from './routes/comments.getRouter'
import getPostsRouter from './routes/posts.getRouter'
import getSecurityRouter from './routes/security.getRouter'
import getTestRouter from './routes/test.getRouter'
import getUsersRouter from './routes/users.getRouter'

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
