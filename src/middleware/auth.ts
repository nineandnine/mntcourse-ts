import jwt from 'jsonwebtoken'
import asyncHandler from './async'
import ErrorResponse from '../utils/errorResponse'
import { User } from '../models/User'
import { IUserReq } from './reqresinterface'
import {
  NextFunction,
  Request,
  Response,
} from 'express'

// Protect routes
const protect = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        'Bearer'
      )
    ) {
      // Set token from Bearer Token in header
      token = req.headers.authorization.split(
        ' '
      )[1]

      // Set token from cookie
    } else if (req.cookies.token) {
      token = req.cookies.token
    }

    // Make sure token exists
    if (!token) {
      return next(
        new ErrorResponse(
          'Not authorize to access this route',
          401
        )
      )
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      )
      req.user = await User.findById(decoded)
      next()
    } catch (err) {
      return next(
        new ErrorResponse(
          'Not authorize to access this route',
          401
        )
      )
    }
  }
)

// Grant access to specific roles
const authorize = (...roles: any[]) => {
  return (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      )
    }
    next()
  }
}

export { authorize, protect }
