import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const errors = formatZodErrors(result.error)
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
      return
    }
    req[target] = result.data
    next()
  }
}

function formatZodErrors(error: ZodError) {
  return error.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message,
  }))
}
