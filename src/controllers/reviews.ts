import {
  Request,
  Response,
  NextFunction,
} from 'express'

import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import { Course } from '../models/Course'
import { Bootcamp } from '../models/Bootcamp'
import { Review } from '../models/Review'
import { IUserReq } from '../middleware/reqresinterface'

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
const getReviews = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.params.bootcampId) {
      const reviews = await Review.find({
        bootcampId: req.params.bootcampId,
      })

      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      })
    } else {
      res.status(200).json(res.advancedResults)
    }
  }
)

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const review = await Review.findById(
      req.params.id
    ).populate({
      path: 'bootcamp',
      select: 'name description',
    })

    if (!review) {
      return next(
        new ErrorResponse(
          `No review found with the id of ${req.params.id}`,
          404
        )
      )
    }

    res.status(200).json({
      success: true,
      data: review,
    })
  }
)

// @desc    Add Review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
const addReview = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(
      req.params.bootcampId
    )

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `No bootcamp with the id of ${req.params.bootcampId}`,
          404
        )
      )
    }

    const review = await Review.create(req.body)

    res.status(201).json({
      success: true,
      data: review,
    })
  }
)

// @desc    Update Review
// @route   POST /api/v1/reviews/:id
// @access  Private
const updateReview = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    let review = await Review.findById(
      req.params.id
    )

    if (!review) {
      return next(
        new ErrorResponse(
          `No review with the id of ${req.params.id}`,
          404
        )
      )
    }

    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `Not authorized to update review`,
          401
        )
      )
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      success: true,
      data: review,
    })
  }
)

// @desc    Delete Review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const review = await Review.findById(
      req.params.id
    )

    if (!review) {
      return next(
        new ErrorResponse(
          `No review with the id of ${req.params.id}`,
          404
        )
      )
    }

    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `Not authorized to delete review`,
          401
        )
      )
    }

    await review.remove()

    res.status(200).json({
      success: true,
      data: {},
    })
  }
)

export {
  getReview,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
}
