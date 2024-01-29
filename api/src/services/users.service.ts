import { CreateUserDtoModel } from '../models/input/users.input.model'
import { usersRepository } from '../repositories/users.repository'
import { commonService } from './common'

export const usersService = {
	async getUser(userId: string) {
		return usersRepository.getUserById(userId)
	},

	async createUserByAdmin(dto: CreateUserDtoModel) {
		const newUserDto = await commonService.getCreateUserDto(dto, true)

		return usersRepository.createUser(newUserDto)
	},

	async deleteUser(userId: string): Promise<boolean> {
		return usersRepository.deleteUser(userId)
	},
}
