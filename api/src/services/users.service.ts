import { inject, injectable } from 'inversify'
import { ClassNames } from '../composition/classNames'
import { CreateUserDtoModel } from '../models/input/users.input.model'
import { UsersRepository } from '../repositories/users.repository'
import { CommonService } from './common.service'

@injectable()
export class UsersService {
	@inject(ClassNames.UsersRepository) protected usersRepository: UsersRepository
	@inject(ClassNames.CommonService) private commonService: CommonService

	async getUser(userId: string) {
		return this.usersRepository.getUserById(userId)
	}

	async createUserByAdmin(dto: CreateUserDtoModel) {
		const newUserDto = await this.commonService.getCreateUserDto(dto, true)
		return this.usersRepository.createUser(newUserDto)
	}

	async deleteUser(userId: string): Promise<boolean> {
		return this.usersRepository.deleteUser(userId)
	}
}
