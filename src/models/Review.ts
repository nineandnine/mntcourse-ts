import mongoose, { Types } from 'mongoose'
import { IBootcamp } from './Bootcamp'
import { IUser } from './User'
export interface IReview {
  title?: string
  text?: string
  rating?: number
  createdAt?: Date
  bootcamp?: Types.ObjectId
  user?: Types.ObjectId
}
interface IReviewDoc extends mongoose.Document {
  title?: string
  text?: string
  rating?: number
  createdAt?: Date
  bootcamp?: Types.ObjectId
  user?: Types.ObjectId
}
interface IReviewModel
  extends mongoose.Model<IReviewDoc> {
  build(attrs: IReview): IReviewDoc
  getAverageRating(): Promise<number>
}
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [
      true,
      'Please add a title for the review',
    ],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [
      true,
      'Please add rating between 1 and 10',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

// Prevent user from submitting more than per bootcamp
ReviewSchema.index(
  {
    bootcamp: 1,
    user: 1,
  },
  { unique: true }
)

ReviewSchema.statics.getAverageRating = async function (
  bootcampId: string
) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRatings: { $avg: '$rating' },
      },
    },
  ])
  try {
    await this.model(
      'Bootcamp'
    ).findByIdAndUpdate(bootcampId, {
      averageRatings: obj[0].averageRatings,
    })
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err)
  }
}

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp)
})
const Review = mongoose.model<
  IReviewDoc,
  IReviewModel
>('Review', ReviewSchema)

export { Review }
