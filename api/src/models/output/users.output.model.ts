import { ItemsOutModel } from './common'

export type UserOutModel = {
	id: string
	login: string
	email: string
	createdAt: string
}

export type GetUsersOutModel = ItemsOutModel<UserOutModel>

export type GetUserOutModel = UserOutModel
