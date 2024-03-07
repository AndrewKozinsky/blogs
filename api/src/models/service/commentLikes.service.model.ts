import { DBTypes } from '../../db/dbTypes'

export type CommentLikeServiceModel = {
	commentId: string
	userId: string
	status: DBTypes.LikeStatuses
}
