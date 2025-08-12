import Joi from 'joi'
import UserType from './user.type'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,50}$/

export const createUserValidation = (payload: UserType) => {
  const schema = Joi.object({
    nama: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).pattern(passwordRegex).required().messages({
      'string.pattern.base': 'Password wajib menggunakan huruf besar, huruf kecil, angka dan simbol'
    }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Konfirmasi Password harus sesuai'
    }),
    role: Joi.string().valid('manager', 'admin', 'user').default('user'),
    phone: Joi.string().min(10).max(15).required()
  })
  return schema.validate(payload)
}

export const createSessionValidation = (payload: UserType) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required()
  })
  return schema.validate(payload)
}

export const refreshSessionValidation = (payload: UserType) => {
  const schema = Joi.object({
    refresh_token: Joi.string().required()
  })
  return schema.validate(payload)
}
