// reviewRoute.js
import express from 'express'
import { addReview, getProductReviews, getUserReviews } from '../controllers/reviewController.js'
import authUser from '../middleware/auth.js'

const reviewRouter = express.Router()

reviewRouter.post('/add', authUser, addReview)
reviewRouter.post('/product', getProductReviews)
reviewRouter.post('/user', authUser, getUserReviews)

export default reviewRouter