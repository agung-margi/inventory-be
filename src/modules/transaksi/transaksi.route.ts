import { Router } from 'express'
import { createTransaksiOut } from './transaksi.controller'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/', requireAdmin, requireAuth, createTransaksiOut)
