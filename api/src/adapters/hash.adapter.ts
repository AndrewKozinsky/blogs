import bcrypt from 'bcrypt'

class HashService {
	generateSalt() {
		return bcrypt.genSalt()
	}
	generateHash(str: string, salt: string) {
		return bcrypt.hash(str, salt)
	}
	async hashedString(str: string) {
		const passwordSalt = await this.generateSalt()
		return await this.generateHash(str, passwordSalt)
	}
	compare(str: string, hashedStr: string) {
		return bcrypt.compare(str, hashedStr)
	}
}

export const hashService = new HashService()
