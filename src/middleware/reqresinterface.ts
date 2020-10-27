import { Request, Response } from 'express'

export interface IUserReq extends Request {
  user: any
  query: any
}
export interface IUserRes extends Response {
  advancedResults: any
}
