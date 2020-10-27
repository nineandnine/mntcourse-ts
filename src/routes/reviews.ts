import express from 'express'
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews'
import advanceResults from '../middleware/advancedResults'
import { Review } from '../models/Review'
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
    advanceResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(
    protect,
    authorize('user', 'admin'),
    addReview
  )

router
  .route('/:id')
  .get(getReview)
  .put(
    protect,
    authorize('user', 'admin'),
    updateReview
  )
  .delete(
    protect,
    authorize('user', 'admin'),
    deleteReview
  )

export default router
