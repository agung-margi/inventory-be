import Joi from 'joi'
import ItemType from './item.type'

export const createItemValidation = (payload: ItemType) => {
    const schema = Joi.object({
        designator : Joi.string().required(),
        nama_item : Joi.string().required(),
        kategori : Joi.string().required(),
    })
    return schema.validate(payload)
}

export const updateItemValidation = (payload: ItemType) => {
    const schema = Joi.object({
        designator : Joi.string().required(),
        nama_item : Joi.string().required(),
        kategori : Joi.string().required(),
    })
    return schema.validate(payload)
}