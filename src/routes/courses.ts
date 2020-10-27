import express from 'express'
import {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses'
import advanceResults from '../middleware/advancedResults'
import { Course } from '../models/Course'
import {
  protect,
  authorize,
} from '../middleware/auth'

const router = express.Router({
  mergeParams: true,
})

router
  .route('/')
  .get(
    advanceResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(
    protect,
    authorize('publisher', 'admin'),
    addCourse
  )
router
  .route('/:id')
  .get(getCourse)
  .put(
    protect,
    authorize('publisher', 'admin'),
    updateCourse
  )
  .delete(
    protect,
    authorize('publisher', 'admin'),
    deleteCourse
  )

export default router
