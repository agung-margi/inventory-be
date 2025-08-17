
import Joi from 'joi'
import { PenerimaanType } from './penerimaan.type'

export const PenerimaanValidation = (payload: PenerimaanType) => {
  const schema = Joi.object({
    pengirimanId: Joi.string(),
    warehouseId: Joi.string().required(),
    sumber: Joi.string().required(),
    jenis: Joi.string().valid('vendor', 'antar gudang').required(),
    items: Joi.array().items(
    Joi.object({
      designator: Joi.string().required(),
      qty: Joi.number().positive().required(),
      keterangan: Joi.string().optional(),
      satuan: Joi.string().optional()
    })
  ).min(1).required()
  })
  return schema.validate(payload)
}
