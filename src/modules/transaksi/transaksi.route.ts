import { Router } from 'express'
import { approvePermintaan, createPenerimaan, createPermintaan, createTransaksiOut, getAllPermintaan } from './transaksi.controller'
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/', requireAuth, createTransaksiOut)
TransaksiRouter.post('/penerimaan', requireAuth, createPenerimaan)
TransaksiRouter.post('/permintaan', requireAuth, createPermintaan)
TransaksiRouter.get('/permintaan', requireAuth, getAllPermintaan)
TransaksiRouter.put('/permintaan/:id', requireAuth, approvePermintaan)