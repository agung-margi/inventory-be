import Joi from 'joi'
import ProductType from './product.type'

export const createProductValidation = (payload: ProductType) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
    speed: Joi.number().required(),
    price: Joi.number().required(),
    description: Joi.string().max(300).allow(null)
  })
  return schema.validate(payload)
}

export const updateProductValidation = (payload: ProductType) => {
  const schema = Joi.object({
    name: Joi.string().min(3),
    speed: Joi.number(),
    price: Joi.number(),
    description: Joi.string().max(300).allow(null)
  })
  return schema.validate(payload)
}