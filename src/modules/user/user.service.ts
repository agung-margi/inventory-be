import { PrismaClient } from '@prisma/client'
import UserType, { UserFilter } from './user.type'
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
  if (payload.password !== payload.confirmPassword) {
    throw new Error('Password dan Konfirmasi Password harus sesuai')
  }

  // hashPassword
  const hashedPassword = await hashPassword(payload.password)
  // insert ke DB
  const newUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      nama: payload.nama,
      email: payload.email,
      phone: payload.phone,
      password: hashedPassword,
      role: payload.role,
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

export const getUserById = async (id: string) => {
  if (!id) {
    throw new Error('User ID is required')
  } else {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null }
    })
    return {
      data: user
    }
  }
}

export const getAllUserService = async (filters: UserFilter) => {
  const { nama, kode_wh, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = filters
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(nama && { nama: { contains: nama, mode: 'insensitive' } }),
        ...(role && { role }),
        ...(kode_wh && { kode_wh: { contains: kode_wh, mode: 'insensitive' } })
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        kodeWh: {
          select: {
            nama_wh: true
          }
        }
      }
    }),
    prisma.user.count({
      where: {
        ...(nama && { nama: { contains: nama, mode: 'insensitive' } }),
        ...(role && { role }),
        ...(kode_wh && { kode_wh: { contains: kode_wh, mode: 'insensitive' } })
      }
    })
  ])

  // Opsional: kamu bisa transform data supaya nama warehouse masuk langsung ke property user
  const data = users.map((user) => ({
    ...user,
    nama_warehouse: user.kodeWh?.nama_wh ?? null,
    kodeWh: undefined // kalau mau hilangkan object kodeWh yang asli
  }))

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}
