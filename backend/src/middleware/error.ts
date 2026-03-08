import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(StatusCodes.NOT_FOUND, `${resource} not found`, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(StatusCodes.UNAUTHORIZED, message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(StatusCodes.FORBIDDEN, message, 'FORBIDDEN')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(StatusCodes.CONFLICT, message, 'CONFLICT')
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(StatusCodes.BAD_REQUEST, message, 'BAD_REQUEST')
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    })
    return
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] ?? 'field'
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `A record with this ${field} already exists`,
        code: 'DUPLICATE_KEY',
      })
      return
    }
    if (prismaErr.code === 'P2025') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      })
      return
    }
  }

  console.error('Unhandled error:', err)
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  })
}
