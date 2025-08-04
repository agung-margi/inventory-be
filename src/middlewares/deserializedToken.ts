import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../utils/jwt'

const deserializedToken = (req: Request, res: Response, next: NextFunction) => {
  // const accessToken = req.headers.authorization?.replace(/^Bearer\s/, '')

  // baca token dari cookie
  const accessToken = req.cookies.token 
  if (!accessToken) {
    return next()
  }
  const token: any = verifyJWT(accessToken)
  if (token.decoded) {
    res.locals.user = token.decoded
    return next()
  }
  if (token.expired) {
    return next()
  }
  return next()
}

export default deserializedToken
