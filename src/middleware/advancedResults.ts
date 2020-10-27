import { populate } from '../models/Course'
import {
  IUserReq,
  IUserRes,
} from './reqresinterface'
import { NextFunction } from 'express'
const advanceResults = (
  model: any,
  populate: any
) => async (
  req: IUserReq,
  res: IUserRes,
  next: NextFunction
) => {
  let query

  // Copy req.query
  const reqQuery = { ...req.query }

  // query command
  const queryCommand = [
    'select',
    'sort',
    'page',
    'limit',
  ]

  // Loop over remove fields and delete them from request query
  // @DELETE REQUEST FIELD
  queryCommand.forEach(
    (param) => delete reqQuery[param]
  )

  // Create query String
  let queryStr = JSON.stringify(reqQuery)

  // Create operators($gt, $gte, etc)
  // @FILTERING
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )

  // Finding resourece
  query = model.find(JSON.parse(queryStr))

  // @SELECT
  if (req.query.select) {
    // split dari koma
    const fields = req.query.select
      .split(',')
      .join(' ')
    //  pilih field yg hanya ingin ditampilkan
    // select adalah command nosql dari mongo
    query = query.select(fields)
  }

  // @SORT
  if (req.query.sort) {
    const sortBy = req.query.sort
      .split(',')
      .join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }
  // @PAGINATION
  const page = parseInt(req.query.page, 10) || 1
  const limit =
    parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()

  query = query.skip(startIndex).limit(limit)

  if (populate) {
    query = query.populate(populate)
  }
  // Pagination Result
  const pagination: any = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }
  //  excecuting query
  const results = await query

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  }

  next()
}

export default advanceResults
