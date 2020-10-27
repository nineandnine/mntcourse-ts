import path from 'path'
import {
  Request,
  Response,
  NextFunction,
} from 'express'
import ErrorResponse from '../utils/errorResponse'
import asyncHandler from '../middleware/async'
import { Bootcamp } from '../models/Bootcamp'
import geocoder from '../utils/geocoder'
import { IUserReq } from '../middleware/reqresinterface'

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
const getBootcamps = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(200).json(res.advancedResults)
  }
)

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
const getBootcamp = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const bootcamp = await Bootcamp.findById(
      req.params.id
    )
    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      )
    }
    res.status(200).json({
      success: true,

      data: bootcamp,
    })
  }
)

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
const createBootcamp = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    // Add user to req.body
    req.body.user = req.user.id

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne(
      { user: req.user.id }
    )

    // If the user is not an admin, they ca only add one bootcamp
    if (
      publishedBootcamp &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} has already published a bootcamp`,
          400
        )
      )
    }

    const bootcamp = await Bootcamp.create(
      req.body
    )

    res.status(201).json({
      success: true,
      data: bootcamp,
    })
  }
)

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
const updateBootcamps = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    let bootcamp = await Bootcamp.findById(
      req.params.id
    )

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      )
    }
    // Make sure user is bootcamp owner
    if (
      bootcamp.user.id.toString() !==
        req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.params.id} is not authorized to update this bootcamp`,
          401
        )
      )
    }

    bootcamp = await Bootcamp.findOneAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      success: true,
      data: bootcamp,
    })
  }
)

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
const deleteBootcamps = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const bootcamp = await Bootcamp.findById(
      req.params.id
    )

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
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
          `User ${req.user.id} is not authorized to delete this bootcamp`,
          401
        )
      )
    }

    await bootcamp.remove()
    res.status(200).json({
      success: true,
      data: {},
    })
  }
)

// @desc    Get bootcamps within a radius
// @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
const getBootcampsInRadius = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { zipcode, distance } = req.params

    // get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians
    // Divide distance by radius of earth
    // Earth radius = 3,963 mi / 6.378km
    const radius = Number(distance) / 3963
    const bootcamps = await Bootcamp.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius],
        },
      },
    })
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
    })
  }
)

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
const bootcampPhotoUpload = asyncHandler(
  async (
    req: IUserReq,
    res: Response,
    next: NextFunction
  ) => {
    const bootcamp = await Bootcamp.findById(
      req.params.id
    )

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
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
          `User ${req.params.id} is not authorized to update this bootcamp`,
          401
        )
      )
    }

    if (!req.files) {
      return next(
        new ErrorResponse(
          `Please upload a file`,
          400
        )
      )
    }

    const file = req.files.file
    // Make sure image photo
    if (!file.mimetype.startsWith('image')) {
      return next(
        new ErrorResponse(
          `Please upload an image file`,
          400
        )
      )
    }

    // Check filesize
    if (
      file.size >
      Number(process.env.MAX_FILE_UPLOAD!)
    ) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      )
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${
      path.parse(file.name).ext
    }`
    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      async (err) => {
        if (err) {
          // tslint:disable-next-line:no-console
          console.error(err)
          return next(
            new ErrorResponse(
              `Problem with file upload`,
              500
            )
          )
        }
        await Bootcamp.findByIdAndUpdate(
          req.params.id,
          { photo: file.name }
        )
      }
    )

    res.status(200).json({
      success: true,
      data: file.name,
    })
  }
)

export {
  getBootcamp,
  getBootcamps,
  getBootcampsInRadius,
  createBootcamp,
  updateBootcamps,
  deleteBootcamps,
  bootcampPhotoUpload,
}
