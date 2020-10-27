import express from 'express'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users'
import advanceResults from '../middleware/advancedResults'
import { User } from '../models/User'
import {
  protect,
  authorize,
} from '../middleware/auth'

const router = express.Router({
  mergeParams: true,
})

router.use(protect)
router.use(authorize('admin'))

router
  .route('/')
  .get(advanceResults(User), getUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

export default router
