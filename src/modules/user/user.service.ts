import { PrismaClient } from '@prisma/client'
import UserType from './user.type'
import { v4 as uuidv4 } from 'uuid'
import { comparePassword, hashPassword } from '../../utils/hashing'
import { signJWT, verifyJWT } from '../../utils/jwt'

const prisma = new PrismaClient()

export const saveUserService = async (payload: UserType) => {
  // checkuser
  const userExist = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true } // cukup ambil id untuk cek
  })
  if (userExist) throw new Error('Email telah terdaftar')

  // compare password with confirmPassword
  if (payload.password !== payload.confirm_password) {
    throw new Error('Password dan Konfirmasi Password harus sesuai')
  }

  // hashPassword
  const hashedPassword = await hashPassword(payload.password)
  // insert ke DB
  const newUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      nama: '',
      email: payload.email,
      phone: '',
      password: hashedPassword,
      role: 'user',
      createdBy: 'system'
    }
  })
  return newUser
}

export const loginService = async (payload: UserType) => {
  // checkuser
  const user: any = await prisma.user.findUnique({
    where: { email: payload.email }
  })
  if (!user) throw new Error('User dan Password Salah')
  // checkPassword
  const isValid = await comparePassword(payload.password, user.password)

  if (!isValid) throw new Error('User dan Password Salah')
  const { id, name, role } = user

  const accessToken = signJWT({ id, name, role }, { expiresIn: '1h' })
  const refreshToken = signJWT({ id, name, role }, { expiresIn: '1d' })

  return { accessToken, refreshToken }
}

export const refreshTokenService = async (refreshToken: string) => {
  const { decoded } = verifyJWT(refreshToken)

  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) {
    throw new Error('Invalid refresh token')
  }
  const accessToken = signJWT(
    {
      userId: user.id,
      name: user.nama,
      role: user.role
    },
    { expiresIn: '1h' }
  )
  return accessToken
}

