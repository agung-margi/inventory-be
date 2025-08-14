import { Router } from 'express'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'
import { getAllStock } from './stock.controller'


export const StockRouter: Router = Router()
StockRouter.get('/', requireAdmin, requireAuth, getAllStock)