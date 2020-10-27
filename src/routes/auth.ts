import express from 'express'
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} from '../controllers/auth'
import { protect } from '../middleware/auth'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.get('/logout', logout)
router.put(
  '/updatedetails',
  protect,
  updateDetails
)
router.put(
  '/updatepassword',
  protect,
  updatePassword
)
router.post('/forgotpassword', forgotPassword)
router.put(
  '/resetpassword/:resettoken',
  resetPassword
)
export default router
