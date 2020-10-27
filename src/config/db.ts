import mongoose from 'mongoose'
const connectDB = async () => {
  const conn = await mongoose.connect(
    process.env.MONGO_URI!,
    {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }
  )

  // tslint:disable-next-line:no-console
  console.log(
    `MongoDB connected: ${conn.connection.host}`
  )
}

export { connectDB }
