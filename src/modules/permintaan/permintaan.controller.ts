import { Request, Response } from 'express'
import { approvePermintaanService, getAllPermintaanService, getPermintaanByIdService, saveTransaksiPermintaan } from './permintaan.service'
import { PermintaanValidation } from './permintaan.validator'

export const createPermintaan = async (req: Request, res: Response) => {
  const { error, value } = PermintaanValidation(req.body)

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

    await saveTransaksiPermintaan(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Permintaan berhasil dibuat'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllPermintaan = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    if (id) {
      const permintaan = await getPermintaanByIdService(id)

      if (!permintaan) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'Permintaan tidak ditemukan'
        })
      }

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'Permintaan ditampilkan',
        data: permintaan
      })
    }
    const filters = {
      tanggal: req.query.tanggal ? String(req.query.tanggal) : undefined,
      tujuanWh: req.query.tujuanWh ? String(req.query.tujuanWh) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
      project: req.query.project ? String(req.query.project) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllPermintaanService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Permintaan tidak ditemukan'
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

export const approvePermintaan = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = res.locals.user.id

  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    await approvePermintaanService(id, userId)
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Permintaan berhasil disetujui'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}