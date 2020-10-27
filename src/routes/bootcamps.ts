import express from 'express'
import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamps,
  deleteBootcamps,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} from '../controllers/bootcamps'

// Include other resource routers
import courseRouter from './courses'
import reviewsRouter from './reviews'
import advanceResults from '../middleware/advancedResults'
import { Bootcamp } from '../models/Bootcamp'

const router = express.Router()

import {
  protect,
  authorize,
} from '../middleware/auth'

// Re-route into other resource route
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewsRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)
router
  .route('/')
  .get(
    advanceResults(Bootcamp, 'courses'),
    getBootcamps
  )
  .post(
    protect,
    authorize('publisher', 'admin'),
    createBootcamp
  )
router
  .route('/:id')
  .get(getBootcamp)
  .put(
    protect,
    authorize('publisher', 'admin'),
    updateBootcamps
  )
  .delete(
    protect,
    authorize('publisher', 'admin'),
    deleteBootcamps
  )
router
  .route('/:id/photo')
  .put(protect, bootcampPhotoUpload)

module.exports = router
