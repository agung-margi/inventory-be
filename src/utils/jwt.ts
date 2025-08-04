import jwt from 'jsonwebtoken'
import config from '../configs/environment'

export const signJWT = (payload: Object, options?: jwt.SignOptions | undefined): string => {
  // validasi private key
  if (!config.jwt_private_key) {
    throw new Error('JWT private key is not configured')
  }
  return jwt.sign(payload, config.jwt_private_key, {
    ...(options && options),
    algorithm: 'RS256'
  })
}

export const verifyJWT = (token: string) => {
  try {
    // Validasi public key
    if (!config.jwt_public_key) {
      throw new Error('JWT public key is not configured')
    }

    const decoded: any = jwt.verify(token, config.jwt_public_key)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt expired',
      decoded: null
    }
  }
}
