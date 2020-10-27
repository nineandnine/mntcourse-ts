import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export interface IUser {
  name?: string
  email?: string
  role?: string
  password?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  tokenAccountActivator?: string
  tokenAccountActivatorExpire?: Date
  createdAt?: Date
}
interface IUserDoc extends mongoose.Document {
  name?: string
  email?: string
  role?: string
  password?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  tokenAccountActivator?: string
  tokenAccountActivatorExpire?: Date
  createdAt?: Date
  getSignedJwtToken(): string
  matchPassword(enteredPassword: string): boolean
  getResetPasswordToken(): string
}

interface ICourseModel
  extends mongoose.Model<IUserDoc> {
  build(attrs: IUser): IUserDoc
}
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/,
      'Please add a valid email',
    ],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false,
    minlength: 6,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  tokenAccountActivator: String,
  tokenAccountActivatorExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  let pass = this.get('password')
  pass = await bcrypt.hash(
    this.get('password'),
    salt
  )
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  )
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
) {
  return await bcrypt.compare(
    enteredPassword,
    this.get('password')
  )
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate Token
  const resetToken = crypto
    .randomBytes(20)
    .toString('hex')

  // hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // set expire
  this.resetPasswordExpire =
    Date.now() + 10 * 60 * 100

  return resetToken
}

// Generate and hash password token
// UserSchema.methods.getTokenAccountActivator = function () {
//   //Generate Token
//   const tokenActivator = crypto.randomBytes(20).toString("hex");

//   //hash token and set to resetPasswordToken field
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   //set expire
//   this.resetPasswordExpire = Date.now() + 10 * 60 * 100;

//   return resetToken;
// };
const User = mongoose.model<
  IUserDoc,
  ICourseModel
>('User', UserSchema)

export { User }
