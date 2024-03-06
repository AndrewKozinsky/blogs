import { CreateUserDtoModel } from '../models/input/users.input.model'
import { UsersRepository } from '../repositories/users.repository'
import { commonService } from './common'

export class UsersService {
	constructor(protected usersRepository: UsersRepository) {}

	async getUser(userId: string) {
		return this.usersRepository.getUserById(userId)
	}

	async createUserByAdmin(dto: CreateUserDtoModel) {
		const newUserDto = await commonService.getCreateUserDto(dto, true)

		return this.usersRepository.createUser(newUserDto)
	}

	async deleteUser(userId: string): Promise<boolean> {
		return this.usersRepository.deleteUser(userId)
	}
}
