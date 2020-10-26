import express from 'express'
import bodyParser from 'body-parser'
import {
  Request,
  Response,
} from 'express-serve-static-core'

const app = express()
app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  res.send('mantabs')
})
app.listen(3000)
export default app
