import { app } from './app'

const PORT = process.env.PORT || 5000

const start = app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`
  )
})

process.on(
  'unhandledRejection',
  (err: Error, response) => {
    // tslint:disable-next-line:no-console
    console.log(`Error: ${err.message}`)
    start.close(() => process.exit(1))
  }
)
