import { Request, Response } from 'express'
import { createTransaksiOutValidation } from './transaksi.validator'
import { saveTransaksi } from './transaksi.service'

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