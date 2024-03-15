import { DBTypes } from '../../db/dbTypes'

export type PostLikeServiceModel = {
	postId: string
	userId: string
	status: DBTypes.LikeStatuses
}
