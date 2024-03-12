import { inject, injectable } from 'inversify'
import { EmailAdapter } from '../adapters/email.adapter'
import { ClassNames } from '../composition/classNames'

@injectable()
export class EmailManager {
	@inject(ClassNames.EmailAdapter) private emailAdapter: EmailAdapter

	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string) {
		const subject = 'Registration at our web-site'
		const textMessage = 'Registration at our web-site'
		const htmlMessage = `
<h1>Thanks for your registration</h1>
<p>To finish registration please follow the link below:
	<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
</p>
<p>
	<a href="http://localhost:3000/unsubscribe">unsubscribe</a>
</p>`

		// Send an email
		await this.emailAdapter.sendEmail(userEmail, subject, textMessage, htmlMessage)
	}

	async sendPasswordRecoveryMessage(userEmail: string, recoveryCode: string) {
		const subject = 'Password recovery at our web-site'
		const textMessage = 'Password recovery at our web-site'
		const htmlMessage = `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
  <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
</p>`

		// Send an email
		await this.emailAdapter.sendEmail(userEmail, subject, textMessage, htmlMessage)
	}
}
