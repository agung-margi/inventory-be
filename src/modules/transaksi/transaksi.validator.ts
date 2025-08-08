import Joi from 'joi'
import TransaksiType from './transaksi.type'

export const createTransaksiOutValidation = (payload: TransaksiType) => {
  const schema = Joi.object({
    from_wh: Joi.string().required().min(3),
    to_user: Joi.string().required(),
    items: Joi.array().items(
    Joi.object({
      designator: Joi.string().required(),
      qty: Joi.number().positive().required()
    })
  ).min(1).required()
  })
  return schema.validate(payload)
}
