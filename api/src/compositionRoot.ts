import { BrowserService } from './application/browser.service'
import { JwtService } from './application/jwt.service'
import { RequestService } from './application/request.service'
import { EmailManager } from './managers/email.manager'
import { AuthRepository } from './repositories/auth.repository'
import { BlogsQueryRepository } from './repositories/blogs.queryRepository'
import { BlogsRepository } from './repositories/blogs.repository'
import { CommentLikesRepository } from './repositories/commentLikes.repository'
import { CommentsQueryRepository } from './repositories/comments.queryRepository'
import { CommentsRepository } from './repositories/comments.repository'
import { PostsQueryRepository } from './repositories/posts.queryRepository'
import { PostsRepository } from './repositories/posts.repository'
import { SecurityQueryRepository } from './repositories/security.queryRepository'
import { SecurityRepository } from './repositories/security.repository'
import { UsersRepository } from './repositories/users.repository'
import { AuthRouter } from './routes/auth.routes'
import { BlogsRouter } from './routes/blogs.routes'
import { CommentsRouter } from './routes/comments.routes'
import { PostsRouter } from './routes/posts.routes'
import { SecurityRouter } from './routes/security.routes'
import { TestRouter } from './routes/test.routes'
import { UsersRouter } from './routes/users.routes'
import { AuthService } from './services/auth.service'
import { BlogsService } from './services/blogs.service'
import { CommentsService } from './services/comments.service'
import { PostsService } from './services/posts.service'
import { SecurityService } from './services/security.service'
import { UsersService } from './services/users.service'

export const jwtService = new JwtService()
const emailManager = new EmailManager()
export const browserService = new BrowserService()

export const usersRepository = new UsersRepository()
export const authRepository = new AuthRepository(jwtService)
const postsQueryRepository = new PostsQueryRepository()
const commentLikesRepository = new CommentLikesRepository()
const commentsQueryRepository = new CommentsQueryRepository(commentLikesRepository)
const blogsRepository = new BlogsRepository()
const commentsRepository = new CommentsRepository()
const postsRepository = new PostsRepository()
const securityQueryRepository = new SecurityQueryRepository(authRepository)
const securityRepository = new SecurityRepository()
const blogsQueryRepository = new BlogsQueryRepository(postsQueryRepository)

const usersService = new UsersService(usersRepository)
export const requestService = new RequestService()
const postsService = new PostsService(blogsRepository, commentsRepository, postsRepository)
const authService = new AuthService(
	usersService,
	authRepository,
	usersRepository,
	browserService,
	jwtService,
	requestService,
	emailManager,
)
const securityService = new SecurityService(securityRepository, authRepository, jwtService)
const blogsService = new BlogsService(postsService, blogsRepository)
const commentsService = new CommentsService(commentsRepository, commentLikesRepository)

export const usersRouter = new UsersRouter(usersService)
export const authRouter = new AuthRouter(authService, requestService, jwtService)
export const postsRouter = new PostsRouter(
	postsQueryRepository,
	postsService,
	commentsQueryRepository,
)
export const securityRouter = new SecurityRouter(
	securityQueryRepository,
	securityService,
	requestService,
)
export const testRouter = new TestRouter()
export const blogsRouter = new BlogsRouter(
	blogsService,
	blogsRepository,
	blogsQueryRepository,
	postsQueryRepository,
)
export const commentsRouter = new CommentsRouter(commentsQueryRepository, commentsService)
