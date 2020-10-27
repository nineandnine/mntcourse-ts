import {
  Request,
  Response,
  NextFunction,
} from 'express'
import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import { User } from '../models/User'

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(200).send(res.advancedResults)
  }
)

// @desc    Get single user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
const getUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findById(
      req.params.id
    )

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc    Create user
// @route   POST /api/v1/auth/users
// @access  Private/Admin
const createUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.create(req.body)

    res.status(201).json({
      success: true,
      data: user,
    })
  }
)

// @desc    Update user
// @route   Put /api/v1/auth/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// @desc    Delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      data: {},
    })
  }
)

export {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  createUser,
}
