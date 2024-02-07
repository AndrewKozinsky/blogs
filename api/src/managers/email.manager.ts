import { emailAdapter } from '../adapters/email.adapter'

export const emailManager = {
	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string) {
		const subject = 'Registration at out web-site'
		const textMessage = 'Registration at our web-site'
		const htmlMessage = `
<h1>Thank for your registration</h1>
<p>To finish registration please follow the link below:
	<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
</p>
<p>
	<a href="http://localhost:3000/unsubscribe">unsubscribe</a>
</p>`

		// Send an email
		await emailAdapter.sendEmail(userEmail, subject, textMessage, htmlMessage)
	},
}
