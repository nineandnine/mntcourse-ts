import {
  NextFunction,
  Request,
  Response,
} from 'express'
import ErrorResponse from '../utils/errorResponse'

const errorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  err: any
) => {
  let error = { ...err }
  error.message = err.message
  // Log to console for dev
  // tslint:disable-next-line:no-console
  console.log(err)

  // mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message =
      'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message: any = Object.values(
      err.errors
    ).map((val: any) => val.message)
    // tslint:disable-next-line:no-console
    console.log(message)
    error = new ErrorResponse(message, 400)
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}

export default errorHandler
