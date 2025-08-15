import { Router } from 'express'
import { approvePermintaan, confirmTAG, createPenerimaan, createPermintaan, createTAG, createTransaksiOut, getAllPenerimaan, getAllPengeluaran, getAllPermintaan, getAllTAG } from './transaksi.controller'
import { requireAdmin, requireAuth, requireManager, requireStaffSO } from '../../middlewares/auth.middleware'


export const TransaksiRouter: Router = Router()
TransaksiRouter.post('/pengeluaran', requireAuth, createTransaksiOut)
TransaksiRouter.get('/pengeluaran', requireAuth, getAllPengeluaran)
TransaksiRouter.post('/penerimaan', requireAuth, requireStaffSO, createPenerimaan)
TransaksiRouter.get('/penerimaan', requireAuth, getAllPenerimaan)
TransaksiRouter.post('/permintaan', requireAuth, createPermintaan)
TransaksiRouter.put('/permintaan/:id/approve', requireAuth, requireManager, approvePermintaan)
TransaksiRouter.get('/permintaan/:id', requireAuth, getAllPermintaan)
TransaksiRouter.get('/permintaan', requireAuth, getAllPermintaan)
TransaksiRouter.post('/tag', requireAuth, requireAdmin, createTAG)
TransaksiRouter.post('/tag/confirm', requireAuth, requireAdmin, confirmTAG)
TransaksiRouter.get('/tag', requireAuth, requireAdmin, getAllTAG)
