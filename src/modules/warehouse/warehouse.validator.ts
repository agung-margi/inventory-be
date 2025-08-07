import Joi from 'joi'
import WarehouseType from './warehouse.type'

export const createWarehouseValidation = (payload: WarehouseType) => {
    const schema = Joi.object({
        nama_wh : Joi.string().required(),
        alamat : Joi.string().required(),
    })
    return schema.validate(payload)
}

export const updateWarehouseValidation = (payload: WarehouseType) => {
    const schema = Joi.object({
        nama_wh : Joi.string().required(),
        alamat : Joi.string().required(),
    })
    return schema.validate(payload)
}