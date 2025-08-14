import { Router } from 'express'
import { requireAdmin, requireAuth, requireStaffSO } from '../../middlewares/auth.middleware'
import { getAllStock } from './stock.controller'


export const StockRouter: Router = Router()
StockRouter.get('/', requireAdmin || requireStaffSO, requireAuth, getAllStock)