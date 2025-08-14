import { Router } from 'express'
import { approvePermintaan, confirmTAG, createPenerimaan, createPermintaan, createTAG, createTransaksiOut, getAllPermintaan } from './transaksi.controller'
import { requireAdmin, requireAuth, requireManager } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/pengeluaran', requireAuth, createTransaksiOut)
TransaksiRouter.post('/penerimaan', requireAuth, createPenerimaan)
TransaksiRouter.post('/permintaan', requireAuth, createPermintaan)
TransaksiRouter.put('/permintaan/:id/approve', requireAuth, requireManager, approvePermintaan)
TransaksiRouter.get('/permintaan/:id', requireAuth, getAllPermintaan)
TransaksiRouter.get('/permintaan', requireAuth, getAllPermintaan)
TransaksiRouter.post('/tag', requireAuth, requireAdmin, createTAG)
TransaksiRouter.post('/tag/confirm', requireAuth, requireAdmin, confirmTAG)
