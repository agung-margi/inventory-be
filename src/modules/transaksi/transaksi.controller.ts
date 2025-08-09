import { Request, Response } from 'express'
import { createTransaksiOutValidation, PenerimaanValidation, PermintaanValidation } from './transaksi.validator'
import { approvePermintaanService, saveTransaksi, saveTransaksiPenerimaan, saveTransaksiPermintaan } from './transaksi.service'

export const createTransaksiOut = async (req: Request, res: Response) => {
    const {error, value} = createTransaksiOutValidation(req.body)

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

    await saveTransaksi(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Transaksi berhasil dibuat'
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
  const {error, value} = PenerimaanValidation(req.body)

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

export const createPermintaan = async (req: Request, res: Response) => {
   const {error, value} = PermintaanValidation(req.body)

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

export const getAllPermintaan = async(req: Request, res: Response) => {

console.log('getAllPermintaan called')}

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