
import Joi from 'joi'
import { TAGType } from './tag.tpye'


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


