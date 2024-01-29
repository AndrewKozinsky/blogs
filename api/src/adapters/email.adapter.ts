const sendpulse = require('sendpulse-api')

export const emailAdapter = {
	async sendEmail(toEmail: string, subject: string, textMessage: string, htmlMessage: string) {
		return new Promise((resolve, reject) => {
			/*
			 * https://login.sendpulse.com/settings/#api
			 */
			const API_USER_ID = 'b96661c19faf35a7a862d56abbae22c8'
			const API_SECRET = 'ab8cc8878db31680bfacab37e9382933'
			const TOKEN_STORAGE = '/tmp/'

			sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function () {
				const emailOptions = {
					html: htmlMessage,
					text: textMessage,
					subject: subject,
					from: {
						name: 'Andrew Kozinsky',
						email: 'mail@andrewkozinsky.ru',
					},
					to: [
						{
							email: toEmail,
						},
					],
				}

				try {
					sendpulse.smtpSendMail(() => {
						console.log('Message was sent')
						resolve(null)
					}, emailOptions)
				} catch (err) {
					console.log(err)
					reject()
				}
			})
		})
	},
}
