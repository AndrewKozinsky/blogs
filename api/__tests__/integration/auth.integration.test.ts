import { EmailManager } from '../../src/managers/email.manager'
import { AuthService } from '../../src/services/auth.service'
import { resetDbEveryTest } from '../e2e/utils/common'
// import testSeeder from './testSeeder'

resetDbEveryTest()

it.skip('123', () => {
	expect(2).toBe(2)
})

// Второй вариант вместо использования jest.fn() сделать полноценный макет
/*// с простой реализацией метод sendEmailConfirmationMessage
const emailManagerMock: typeof emailManager = {
	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string) {
		return
	},
}*/

/*describe('User registration', () => {
	// Ссылка на тестируемую функцию, чтобы вызывать через короткое имя
	const registerUser = authService.registration

	// Реализовать возвращаемое значение, если это требуется
	emailManager.sendEmailConfirmationMessage = jest.fn().mockImplementation((registerUser) => {
		return true
	})

	it.skip('Should  register user with correct dto', async () => {
		// Через специальный самописный объект testSeeder создам DTO,
		// которое нужно передать в тестируемую функцию в качестве аргумента
		// Это всего лишь объект с тремя полями.
		const dto = testSeeder.createUserDto()

		// Получить результат, который буду проверять
		const result = await registerUser(dto)

		// Проверю, что функция authService.registration возвратила такой объект.
		expect(result).toEqual({
			status: 'success',
		})

		expect(emailManager.sendEmailConfirmationMessage).toBeCalledTimes(1)
	})

	it.skip('Should not register user twice', async () => {
		const dto = testSeeder.createUserDto()
		await testSeeder.registerUser(dto)

		// Получить результат, который буду проверять
		const result = await registerUser(dto)

		// Проверю, что функция authService.registration возвратила такой объект.
		expect(result).toEqual({
			status: 'fail',
		})
	})
})*/
