import 'reflect-metadata'
import { Container } from 'inversify'
import { EmailAdapter } from '../adapters/email.adapter'
import { HashService } from '../adapters/hash.adapter'
import { BrowserService } from '../application/browser.service'
import { JwtService } from '../application/jwt.service'
import { RequestService } from '../application/request.service'
import { DbService } from '../db/dbService'
import { EmailManager } from '../managers/email.manager'
import { AuthRepository } from '../repositories/auth.repository'
import { BlogsQueryRepository } from '../repositories/blogs.queryRepository'
import { BlogsRepository } from '../repositories/blogs.repository'
import { CommentLikesRepository } from '../repositories/commentLikes.repository'
import { CommentsQueryRepository } from '../repositories/comments.queryRepository'
import { CommentsRepository } from '../repositories/comments.repository'
import { PostLikesRepository } from '../repositories/postLikes.repository'
import { PostsQueryRepository } from '../repositories/posts.queryRepository'
import { PostsRepository } from '../repositories/posts.repository'
import { SecurityQueryRepository } from '../repositories/security.queryRepository'
import { SecurityRepository } from '../repositories/security.repository'
import { UsersQueryRepository } from '../repositories/users.queryRepository'
import { UsersRepository } from '../repositories/users.repository'
import { AuthRouter } from '../routes/auth.routes'
import { BlogsRouter } from '../routes/blogs.routes'
import { CommentsRouter } from '../routes/comments.routes'
import { PostsRouter } from '../routes/posts.routes'
import { SecurityRouter } from '../routes/security.routes'
import { TestRouter } from '../routes/test.routes'
import { UsersRouter } from '../routes/users.routes'
import { AuthService } from '../services/auth.service'
import { BlogsService } from '../services/blogs.service'
import { CommentsService } from '../services/comments.service'
import { CommonService } from '../services/common.service'
import { PostsService } from '../services/posts.service'
import { SecurityService } from '../services/security.service'
import { UsersService } from '../services/users.service'
import { ClassNames } from './classNames'

export const myContainer = new Container()

myContainer.bind(ClassNames.JwtService).to(JwtService)
myContainer.bind(ClassNames.EmailAdapter).to(EmailAdapter)
myContainer.bind(ClassNames.EmailManager).to(EmailManager)
myContainer.bind(ClassNames.BrowserService).to(BrowserService)
myContainer.bind(ClassNames.HashService).to(HashService)
myContainer.bind(ClassNames.DbService).to(DbService)
myContainer.bind(ClassNames.CommonService).to(CommonService)
myContainer.bind(ClassNames.UsersRepository).to(UsersRepository)
myContainer.bind(ClassNames.AuthRepository).to(AuthRepository)
myContainer.bind(ClassNames.PostsQueryRepository).to(PostsQueryRepository)
myContainer.bind(ClassNames.CommentLikesRepository).to(CommentLikesRepository)
myContainer.bind(ClassNames.CommentsQueryRepository).to(CommentsQueryRepository)
myContainer.bind(ClassNames.BlogsRepository).to(BlogsRepository)
myContainer.bind(ClassNames.CommentsRepository).to(CommentsRepository)
myContainer.bind(ClassNames.PostsRepository).to(PostsRepository)
myContainer.bind(ClassNames.PostLikesRepository).to(PostLikesRepository)
myContainer.bind(ClassNames.SecurityQueryRepository).to(SecurityQueryRepository)
myContainer.bind(ClassNames.SecurityRepository).to(SecurityRepository)
myContainer.bind(ClassNames.BlogsQueryRepository).to(BlogsQueryRepository)
myContainer.bind(ClassNames.UsersService).to(UsersService)
myContainer.bind(ClassNames.RequestService).to(RequestService)
myContainer.bind(ClassNames.PostsService).to(PostsService)
myContainer.bind(ClassNames.AuthService).to(AuthService)
myContainer.bind(ClassNames.SecurityService).to(SecurityService)
myContainer.bind(ClassNames.BlogsService).to(BlogsService)
myContainer.bind(ClassNames.CommentsService).to(CommentsService)
myContainer.bind(ClassNames.UsersRouter).to(UsersRouter)
myContainer.bind(ClassNames.AuthRouter).to(AuthRouter)
myContainer.bind(ClassNames.PostsRouter).to(PostsRouter)
myContainer.bind(ClassNames.SecurityRouter).to(SecurityRouter)
myContainer.bind(ClassNames.TestRouter).to(TestRouter)
myContainer.bind(ClassNames.BlogsRouter).to(BlogsRouter)
myContainer.bind(ClassNames.CommentsRouter).to(CommentsRouter)
myContainer.bind(ClassNames.UsersQueryRepository).to(UsersQueryRepository)
