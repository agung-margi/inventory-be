import { Request, Response } from 'express'
import { createItemValidation, updateItemValidation } from './item.validator'
import { createItemService, deleteItemService, getAllItemService, getItemByIdService, updateItemService } from './item.service'

export const createItem = async (req: Request, res: Response) => {
  try {

    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }


    const { error, value } = createItemValidation(req.body)

    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }

    await createItemService(value, userId)

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Registrasi Item Berhasil'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const updateItem = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {

    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    const { error, value } = updateItemValidation(req.body)

    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }

    await updateItemService(id, value, userId)

    res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Item berhasil diupdate"
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteItem = async (req: Request, res: Response) => {
    const {
    params: { id }
  } = req

  try {
    const userId = res.locals.user.id

    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }

    await deleteItemService(id, userId)

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Item berhasil dihapus'
    })
    
  } catch (error) {
     res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}


export const getAllItem = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {
    if (id) {
      const warehouse = await getItemByIdService(id)

      if (!warehouse.data) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'Item tidak ditemukan'
        })
      }

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'List item berhasil ditampilkan',
        ...warehouse
      })
    }

    const filters = {
      designator: req.query.designator?.toString(),
      nama_item: req.query.namaItem?.toString(),
      kategori: req.query.kategori?.toString(),
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllItemService(filters)

    if (result.data.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Item tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'List item berhasil ditampilkan',
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