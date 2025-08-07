import { Request, Response } from 'express'
import { createWarehouseValidation, updateWarehouseValidation } from './warehouse.validator'
import { createWHService, deleteWHService, getAllWHService, getWHByIdService, updateWHService } from './warehouse.service'

export const createWarehouse = async (req: Request, res: Response) => {
  try {

    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }


    const { error, value } = createWarehouseValidation(req.body)

    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }

    await createWHService(value, userId)

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Registrasi Warehouse Berhasil'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const updateWarehouse = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {

    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    const { error, value } = updateWarehouseValidation(req.body)

    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }

    await updateWHService(id, value, userId)

    res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Warehouse berhasil diupdate"
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteWarehouse = async (req: Request, res: Response) => {
    const {
    params: { id }
  } = req

  try {
    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await deleteWHService(id, userId)

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Warehouse berhasil dihapus'
    })
    
  } catch (error) {
     res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


export const getAllWarehouse = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {
    if (id) {
      const warehouse = await getWHByIdService(id)

      if (!warehouse.data) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'Warehouse tidak ditemukan'
        })
      }

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'List warehouse berhasil ditampilkan',
        ...warehouse
      })
    }

    const filters = {
      kode_wh: req.query.kodeWh?.toString(),
      nama_wh: req.query.namaWh?.toString(),
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllWHService(filters)

    if (result.data.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Warehouse tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'List warehouse berhasil ditampilkan',
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