import { Request, Response } from 'express'
import {
  createTransaksiOutValidation,
} from './transaksi.validator'
import {
getAllPengeluaranService,
  getPengeluaranByIdService,
  TransaksiOutService
} from './pengeluaran.service'

export const createTransaksiOut = async (req: Request, res: Response) => {
  const { error, value } = createTransaksiOutValidation(req.body)

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

    await TransaksiOutService(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Transaksi berhasil dibuat'
    })
  } catch (error) {
    console.log(error)
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllPengeluaran = async (req: Request, res: Response) => {
  const userId = res.locals.user.id
  if (!userId) {
    return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
  }

  try {
    const {
      params: { id }
    } = req

    if (id) {
      const pengeluaran = await getPengeluaranByIdService(id)
      if (!pengeluaran) {
        return res.status(404).json({ status: false, statusCode: 404, message: 'Pengeluaran tidak ditemukan' })
      }
      return res.status(200).json({ status: true, statusCode: 200, data: pengeluaran })
    }

    const filters = {
      tanggal: req.query.tanggal ? new Date(String(req.query.tanggal)) : undefined,
      warehouseId: req.query.warehouseId ? String(req.query.warehouseId) : undefined,
      petugasId: req.query.petugasId ? String(req.query.petugasId) : undefined,
      penerimaId: req.query.penerimaId ? String(req.query.penerimaId) : undefined,
      keterangan: req.query.keterangan ? String(req.query.keterangan) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllPengeluaranService(filters)

    if (!result) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data pengeluaran tidak ditemukan'
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

