import Joi from 'joi'
import {PengeluaranType } from './transaksi.type'

export const createTransaksiOutValidation = (payload: PengeluaranType) => {
  const schema = Joi.object({
    warehouseId : Joi.string().required().min(3),
    permintaanId : Joi.string().required(),
    penerimaId: Joi.string().required(),
    keterangan: Joi.string().optional().allow(''),
    items : Joi.array().items(
    Joi.object({
      designator: Joi.string().required(),
      qty: Joi.number().positive().required()
    })
  ).min(1).required()
  })
  return schema.validate(payload)
}



