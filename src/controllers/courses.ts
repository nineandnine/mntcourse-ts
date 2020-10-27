import {
  Request,
  Response,
  NextFunction,
} from 'express'
import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import { Course } from '../models/Course'
import { Bootcamp } from '../models/Bootcamp'
import { IUserReq } from '../middleware/reqresinterface'

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
const getCourses = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.params.bootcampId) {
      const courses = Course.find({
        bootcampId: req.params.bootcampId,
      })

      return res.status(200).json({
        success: true,
        count: (await courses).length,
        data: courses,
      })
    } else {
      res.status(200).json(res.advancedResults)
    }
  }
)

// @desc    Get single course
// @route   GET /api/v1/course/:id
// @access  Public
const getCourse = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const course = await Course.findById(
      req.params.id
    ).populate({
      path: 'bootcamp',
      select: 'name description',
    })

    if (!course) {
      return next(
        new ErrorResponse(
          `No course with the id of ${req.params.id}`,
          404
        )
      )
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  }
)

// @desc    Add Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
const addCourse = asyncHandler(
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
          `No course with the id of ${req.params.bootcampId}`,
          404
        )
      )
    }

    // Make sure user is bootcamp owner
    if (
      bootcamp.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id} `,
          401
        )
      )
    }

    const course = await Course.create(req.body)
    // tslint:disable-next-line:no-console
    console.log(req.body)
    res.status(200).json({
      success: true,
      data: course,
    })
  }
)

// @desc    Update Course
// @route   PUT /api/v1/courses/:id
// @access  Private
const updateCourse = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    let course = await Course.findById(
      req.params.id
    )

    if (!course) {
      return next(
        new ErrorResponse(
          `No course with the id of ${req.params.id}`,
          404
        )
      )
    }
    // Make sure user is course owner
    if (
      course.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update a course ${course._id} `,
          401
        )
      )
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
    course.save()
    res.status(200).json({
      success: true,
      data: course,
    })
  }
)

// @desc    Delete Course
// @route   DELETE /api/v1/courses/:id
// @access  Private
const deleteCourse = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const course = await Course.findById(
      req.params.id
    )

    if (!course) {
      return next(
        new ErrorResponse(
          `No course with the id of ${req.params.id}`,
          404
        )
      )
    }
    // Make sure user is course owner
    if (
      course.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete a course ${course._id} `,
          401
        )
      )
    }
    await course.remove()

    res.status(200).json({
      success: true,
      data: {},
    })
  }
)

export {
  getCourse,
  getCourses,
  addCourse,
  deleteCourse,
  updateCourse,
}
