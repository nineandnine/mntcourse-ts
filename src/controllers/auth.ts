import {
  Request,
  Response,
  NextFunction,
} from 'express'
import crypto from 'crypto'
import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import sendEmail from '../utils/sendEmail'
import { IUser, User } from '../models/User'
import { IUserReq } from '../middleware/reqresinterface'

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {
      name,
      email,
      password,
      role,
    } = req.body

    const user = await User.build({
      name,
      email,
      password,
      role,
    })
    // Create token
    const token = user.getSignedJwtToken()

    res.status(200).json({
      success: true,
      token,
    })
  }
)

// @desc    Login User
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
      return next(
        new ErrorResponse(
          'Please provide an email and password',
          400
        )
      )
    }

    // Check for user
    const user = await User.findOne({
      email,
    }).select('+password')

    if (!user) {
      return next(
        new ErrorResponse(
          'Invalid Credentials',
          401
        )
      )
    }

    // Check if password matches
    const isMatch = await user.matchPassword(
      password
    )

    if (!isMatch) {
      return next(
        new ErrorResponse(
          'Invalid Credentials',
          401
        )
      )
    }
    sendTokenResponse(user, 200, res)
  }
)

// Get token from model, create cookie and send response
const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response
) => {
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE) *
          24 *
          60 *
          60 *
          100
    ),
    httpOnly: true,
    secure:
      process.env.NODE_ENV === 'production'
        ? true
        : false,
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
    })
}

// @desc    Get Current logged in User
// @route   GET  /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc    Log out / clear cookies
// @route   GET  /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    res.status(200).json({
      success: true,
      data: {},
    })
  }
)

// @desc    Update user details
// @route   PUT  /api/v1/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    )
    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc    Update password
// @route   GET  /api/v1/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findById(
      req.user.id
    ).select('+password')

    // Check current password
    if (
      !(await user.matchPassword(
        req.body.currentPassword
      ))
    ) {
      return next(
        new ErrorResponse(
          'Password is incorrect',
          401
        )
      )
    }

    user.password = req.body.newPassword
    await user.save()
    sendTokenResponse(user, 200, res)
  }
)

// @desc    Reset password
// @route   GET  /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Get hash password
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex')
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return next(
        new ErrorResponse('Invalid token', 400)
      )
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    sendTokenResponse(user, 200, res)
  }
)

// @desc    Forgot password
// @route   POST  /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findOne({
      email: req.body.email,
    })
    if (!user) {
      return next(
        new ErrorResponse(
          'There is no user with that email',
          404
        )
      )
    }
    const resetToken = user.getResetPasswordToken()
    await user.save({
      validateBeforeSave: false,
    })
    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email becouse you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}
  `

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset token',
        text: message,
      })
      res.status(200).json({
        success: true,
        data: 'Email sent',
      })
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(err)
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({
        validateBeforeSave: false,
      })
      return next(
        new ErrorResponse(
          'email could not be sent',
          500
        )
      )
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

export {
  login,
  register,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  logout,
}
