import Joi from 'joi'
import CustomerType from './customer.type'

export const createCustomerValidation = (payload: CustomerType) => {
    const schema = Joi.object({
        name: Joi.string().required().min(3),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        address: Joi.string().max(300).allow(null)
    })
    return schema.validate(payload)
}