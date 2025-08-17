import { Request, Response } from 'express'
import { TAGValidation } from './tag.validator'
import { PenerimaanValidation } from '../penerimaan/penerimaan.validator'
import { confirmPenerimaanTAGService } from '../penerimaan/penerimaan.service'
import { createTAGService, getAllTAGService, getTAGByid } from './tag.service'


export const createTAG = async (req: Request, res: Response) => {
  const { error, value } = TAGValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await createTAGService(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'TAG berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const confirmTAG = async (req: Request, res: Response) => {
  const { error, value } = PenerimaanValidation(req.body)

  if (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: error.details[0].message
    })
  }

  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await confirmPenerimaanTAGService(value, userId)
    console.log(value)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Penerimaan berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllTAG = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    if (id) {
      const tag = await getTAGByid(id)
      if (!tag) {
        return res.status(404).json({ status: false, statusCode: 404, message: 'TAG tidak ditemukan' })
      }
      return res.status(200).json({ status: true, statusCode: 200, data: tag })
    }

    const filters = {
      tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
      dariWh: req.query.dariWh ? String(req.query.dariWh) : undefined,
      keWh: req.query.keWh ? String(req.query.keWh) : undefined,
      mover: req.query.mover ? String(req.query.mover) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllTAGService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data TAG tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: result
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}