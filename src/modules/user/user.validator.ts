import Joi from 'joi'
import UserType from './user.type'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,50}$/

export const createUserValidation = (payload: UserType) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).pattern(passwordRegex).required().messages({
      'string.pattern.base': 'Password wajib menggunakan huruf besar, huruf kecil, angka dan simbol'
    }),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': 'Konfirmasi Password harus sesuai'
    }),
    isAdmin: Joi.boolean().default(false)
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
