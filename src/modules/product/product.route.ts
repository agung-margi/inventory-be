import { Router } from 'express'
import { createProduct, deleteProduct, getAllProduct, updateProduct } from './product.controller'
import { requireAdmin, requireAuth, requireCsrf, requireUser } from '../../middlewares/auth.middleware'

export const ProductRouter: Router = Router()
ProductRouter.post('/', requireAuth, requireCsrf, requireAdmin, createProduct)
ProductRouter.get('/', getAllProduct)
ProductRouter.get('/:id', getAllProduct)
ProductRouter.put('/:id', requireUser, requireAdmin, updateProduct)
ProductRouter.delete('/:id', requireUser, requireAdmin, deleteProduct)