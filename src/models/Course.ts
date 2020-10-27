import mongoose, { Types } from 'mongoose'
import { IBootcamp } from './Bootcamp'
import { IUser } from './User'
export interface ICourse {
  title?: string
  description?: string
  weeks?: string
  tuition?: string
  minimumSkill?: string
  scholarshipAvailable?: string
  createdAt?: Date
  bootcamp?: Types.ObjectId
  user?: Types.ObjectId
}

interface ICourseDoc extends mongoose.Document {
  title?: string
  description?: string
  weeks?: string
  tuition?: string
  minimumSkill?: string
  scholarshipAvailable?: string
  createdAt?: Date
  bootcamp?: Types.ObjectId
  user?: Types.ObjectId
  getAverageCost(): Promise<number>
}

interface ICourseModel
  extends mongoose.Model<ICourseDoc> {
  build(attrs: ICourse): ICourseDoc
}

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [
      true,
      'Please add number of weeks',
    ],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [
      true,
      'Please add a minimum skill',
    ],
    enum: ['beginner', 'intermediate', 'advance'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
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

CourseSchema.statics.getAverageCost = async function (
  bootcampId: string
) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ])
  try {
    await this.model(
      'Bootcamp'
    ).findByIdAndUpdate(bootcampId, {
      averageCost:
        Math.ceil(obj[0].averageCost / 10) * 10,
    })
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err)
  }
}

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp)
})

const Course = mongoose.model<
  ICourseDoc,
  ICourseModel
>('Course', CourseSchema)
export { Course }
