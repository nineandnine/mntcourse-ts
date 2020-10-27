import { lchmod, lchown } from 'fs'
import mongoose, { Types } from 'mongoose'
import slugify from 'slugify'
import geocoder from '../utils/geocoder'
import { IUser } from './User'
import { ICourse } from './Course'

export interface ILocation {
  type?: string
  coordinates?: number
  formattedAddress?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  country?: string
}

export interface IBootcamp {
  name?: string
  slug?: string
  description?: string
  websites?: string
  phone?: number
  email?: string
  address?: string
  location?: Types.ObjectId
  careers?: string
  averageRatings?: number
  averageCost?: number
  photo?: string
  housing?: boolean
  jobAssistance?: boolean
  jobGuarantee?: boolean
  acceptGi?: boolean
  createdAt?: Date
  user?: Types.ObjectId
}
interface IBootcampDoc extends mongoose.Document {
  name?: string
  slug?: string
  description?: string
  websites?: string
  phone?: number
  email?: string
  address?: string
  location?: ILocation
  careers?: string
  averageRatings?: number
  averageCost?: number
  photo?: string
  housing?: boolean
  jobAssistance?: boolean
  jobGuarantee?: boolean
  acceptGi?: boolean
  createdAt?: Date
  user?: Types.ObjectId
  courses?: Types.ObjectId
}
interface IBootcampModel
  extends mongoose.Model<IBootcampDoc> {
  build(attrs: IBootcamp): IBootcampDoc
}
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [
        50,
        'Name can not be more than 50 characters',
      ],
    },
    slug: String,
    description: {
      type: String,
      required: [
        true,
        'Please add a description',
      ],
      maxlength: [
        500,
        'Description can not be more than characters',
      ],
    },
    websites: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [
        20,
        'Phone number can not be longert than 20 characters',
      ],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/,
        'Please add a valid email',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRatings: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [
        10,
        'Rating must can not be more than 10',
      ],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (
  next
) {
  // tslint:disable-next-line:no-console
  console.log(
    `Course being removed from bootcamp ${this._id}`
  )
  await this.model('Course').deleteMany({
    bootcamp: this._id,
  })
})

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
})

// Create bootcamp slug from the name
BootcampSchema.pre('save', function (next) {
  let slug = this.get('slug')
  slug = slugify(this.get('name'), {
    lower: true,
  })
  next()
})

// Geo-code and Create location field
BootcampSchema.pre('save', async function (next) {
  let addr = this.get('address')
  const loc = await geocoder.geocode()
  let locat = this.get('location')
  locat = {
    type: 'Point',
    coordinates: [
      loc[0].longitude,
      loc[0].latitude,
    ],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  }
  // Do not save address in DB
  addr = undefined
  next()
})

const Bootcamp = mongoose.model<
  IBootcampDoc,
  IBootcampModel
>('Bootcamp', BootcampSchema)

export { Bootcamp }
