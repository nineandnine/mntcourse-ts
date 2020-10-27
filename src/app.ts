import express, {
  Request,
  Response,
} from 'express'
import dotenv from 'dotenv'
import path from 'path'
import morgan from 'morgan'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import cors from 'cors'

// for security middleware
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import { connectDB } from './config/db'

// Routes
import authRouter from './routes/auth'
// DB
connectDB()

// configure env
dotenv.config({ path: './config/config.env' })
// express configuration
const app = express()
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('TEST')
})

// Cookie parser
app.use(cookieParser())
// Logger information
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// File Upload
app.use(fileUpload())
// Sanitizing data, prevent no-sql injection
app.use(mongoSanitize())
// security header
app.use(helmet())
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 100,
})
app.use(limiter)
// prevent http params polution
app.use(hpp())

// Statics Configuration
app.use(
  express.static(path.join(__dirname, 'public'))
)

// Routers
app.use('/api/v1/auth', authRouter)

export { app }
