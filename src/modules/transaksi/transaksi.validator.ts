import Joi from 'joi'
import { PenerimaanType, PengeluaranType, PermintaanType, TAGType } from './transaksi.type'

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


export const TAGValidation = (payload: TAGType
) => {
  const schema = Joi.object({
    dariWh: Joi.string().required(),
    keWh: Joi.string().required(),
    petugasId: Joi.string().required(),
    mover: Joi.string().required(),
    catatan: Joi.string().optional().allow(''),
    items: Joi.array().items(
    Joi.object({
      designator: Joi.string().required(),
      qty: Joi.number().positive().required(),
      keterangan: Joi.string().optional().allow(""),
      satuan: Joi.string().optional().allow("")
    })
  ).min(1).required()
  })
  return schema.validate(payload)
}
