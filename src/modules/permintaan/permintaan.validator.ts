import Joi from 'joi'
import { PermintaanType } from './permintaan.type'

export const PermintaanValidation = (payload: PermintaanType) => {
  const schema = Joi.object({
    tanggal: Joi.date().required(),
    tujuanWh: Joi.string(),
    project: Joi.string().optional(),
    catatan: Joi.string().optional(),
    items: Joi.array().items(
    Joi.object({
      designator: Joi.string().required(),
      qty: Joi.number().positive().required(),
    })
  ).min(1).required()
  })
  return schema.validate(payload)
}
