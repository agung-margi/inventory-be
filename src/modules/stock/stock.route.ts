import { Router } from 'express'
import { requireAdmin, requireAuth, requireAdminOrStaffSO } from '../../middlewares/auth.middleware'
import { getAllStock } from './stock.controller'


export const StockRouter: Router = Router()
StockRouter.get('/', requireAdminOrStaffSO, requireAuth, getAllStock)