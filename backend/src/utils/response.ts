import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export function success<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = StatusCodes.OK,
): void {
  res.status(statusCode).json({ success: true, message, data })
}

export function created<T>(res: Response, data: T, message = 'Created'): void {
  success(res, data, message, StatusCodes.CREATED)
}

export function noContent(res: Response): void {
  res.status(StatusCodes.NO_CONTENT).send()
}

export function paginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number },
): void {
  res.status(StatusCodes.OK).json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
      hasNextPage: meta.page * meta.limit < meta.total,
      hasPrevPage: meta.page > 1,
    },
  })
}
