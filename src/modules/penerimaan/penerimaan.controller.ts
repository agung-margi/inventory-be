
import { Request, Response } from 'express'
import { confirmPenerimaanTAGService, getAllPenerimaanService, saveTransaksiPenerimaan } from './penerimaan.service'
import { PenerimaanValidation } from './penerimaan.validator'


export const getAllPenerimaan = async (req: Request, res: Response) => {
  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    const filters = {
      tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
      pengirimanId: req.query.pengirimanId ? String(req.query.pengirimanId) : undefined,
      jenis: req.query.jenis ? String(req.query.jenis) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllPenerimaanService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data penerimaan tidak ditemukan'
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

export const createPenerimaan = async (req: Request, res: Response) => {
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

    await saveTransaksiPenerimaan(value, userId)
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