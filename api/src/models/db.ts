export namespace DBTypes {
	export type Blog = {
		// _id: ObjectId
		name: string
		description: string
		websiteUrl: string
		createdAt: string
		isMembership: boolean
	}

	export type Post = {
		// _id: ObjectId
		title: string
		shortDescription: string
		content: string
		blogId: string
		blogName: string
		createdAt: string
	}

	export type User = {
		// _id: ObjectId
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
		// _id: ObjectId
		postId: string
		content: string
		commentatorInfo: {
			userId: string
			userLogin: string
		}
		createdAt: string
	}
}
