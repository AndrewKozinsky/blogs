import { DBTypes } from '../../db/dbTypes'
import { ItemsOutModel } from './common'

export type CommentOutModel = {
	id: string
	content: string
	commentatorInfo: {
		userId: string
		userLogin: string
	}
	createdAt: string
	likesInfo: {
		likesCount: number
		dislikesCount: number
		myStatus: DBTypes.LikeStatuses
	}
}

export type GetCommentOutModel = CommentOutModel

export type GetPostCommentsOutModel = ItemsOutModel<CommentOutModel>
