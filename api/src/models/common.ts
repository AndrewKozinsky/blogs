import { Request } from 'express'

export type ReqWithBody<B> = Request<{}, {}, B>
export type ReqWithQuery<Q> = Request<{}, {}, {}, Q>
export type ReqWithParams<P> = Request<P>
export type ReqWithParamsAndBody<T, B> = Request<T, {}, B>
export type ReqWithParamsAndQueries<P, Q> = Request<P, {}, {}, Q>

export type ErrorMessage = {
	message: string
	field: string
}

export type ErrorResponse = {
	errorsMessages: ErrorMessage[]
}
