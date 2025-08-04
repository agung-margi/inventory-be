import { Request, Response } from 'express'

import { deleteProductService, getProductByIdService, getProductsService, saveProductService, updateProductService } from './product.service'
import { createProductValidation, updateProductValidation } from './product.validator'

export const createProduct = async (req: Request, res: Response) => {
  const { error, value } = createProductValidation(req.body)
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

    await saveProductService(value, userId)
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Produk berhasil disimpan'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getAllProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {
    if (id) {
      const product = await getProductByIdService(id)

      if (!product.data) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'Produk tidak ditemukan'
        })
      }

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'List produk berhasil ditampilkan',
        ...product
      })
    }

    const filters = {
      name: req.query.name?.toString(),
      speed: req.query.speed ? parseInt(req.query.speed as string) : undefined,
      price: req.query.price ? parseFloat(req.query.price as string) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getProductsService(filters)

    if (result.data.length === 0) {
      res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Produk tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'List produk berhasil ditampilkan',
      ...result
    })
  } catch (error) {}
}

export const updateProduct = async (req: Request, res: Response) => {
   const {
    params: { id }
  } = req

  const {error, value} = updateProductValidation(req.body)
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

    await updateProductService( id, value, userId)
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Produk berhasil diupdate'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req
  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(401).json({ status: false, statusCode: 401, message: 'Unathorized' })
    }
    await deleteProductService( id, userId)
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Produk berhasil dihapus'
    })
    
  } catch (error) {
     res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }

}