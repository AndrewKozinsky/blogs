export namespace DBTypes {
	export type Blog = {
		name: string
		description: string
		websiteUrl: string
		createdAt: string
		isMembership: boolean
	}

	export type Post = {
		title: string
		shortDescription: string
		content: string
		blogId: string
		blogName: string
		createdAt: string
	}

	export type User = {
		account: {
			login: string
			email: string
			password: string
			createdAt: string
		}
		emailConfirmation: {
			confirmationCode: string
			expirationDate: Date
			isConfirmed: boolean
		}
	}

	export type Comment = {
		postId: string
		content: string
		commentatorInfo: {
			userId: string
			userLogin: string
		}
		createdAt: string
	}

	export type DeviceToken = {
		issuedAt: Date
		expirationDate: Date
		deviceIP: string
		deviceId: string
		deviceName: string
		userId: string
	}
}
