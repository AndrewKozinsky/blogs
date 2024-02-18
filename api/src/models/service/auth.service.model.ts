export type DeviceRefreshTokenServiceModel = {
	id: string
	issuedAt: Date
	expirationDate: Date
	deviceIP: string
	deviceId: string
	deviceName: string
	userId: string
}
