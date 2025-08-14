
import { Request, Response } from 'express'
import { getAllStockService } from './stock.service'

export const getAllStock = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {

    const filters = {
        kode_wh: req.query.kodeWh?.toString(),
        designator: req.query.designator?.toString(),
        satuan: req.query.satuan?.toString(),
        available: req.query.available ? parseInt(req.query.available as string) : undefined,
        transit: req.query.transit ? parseInt(req.query.transit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllStockService(filters)

    if (result.data.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Stock tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'List Stock berhasil ditampilkan',
      ...result
    })
  } catch (error) {
  res.status(500).json({
    status: false,
    statusCode: 500,
    message: error instanceof Error ? error.message : 'Internal server error'
  });
}
}