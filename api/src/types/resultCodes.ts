export type LayerResult<T> = {
	code: LayerResultCode
	errorMessage?: string
	data?: T
}

export enum LayerResultCode {
	Success = 0,
	NotFound = 1,
	Unauthorized = 2,
	BadRequest = 3,
	Forbidden = 4,
}
